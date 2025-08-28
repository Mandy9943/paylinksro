import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../lib/logger.js";
import { prisma } from "../../lib/prisma.js";
import { presignGetUrl } from "../../lib/r2.js";
import { getStripe } from "../../lib/stripe.js";
import { sendMail } from "../../services/mailer.js";

// We use a single handler for Stripe webhooks. Ensure app.ts configured raw body for this path.
export async function stripeWebhookHandler(req: Request, res: Response) {
  const stripe = getStripe();
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.warn("Stripe webhook secret is not set; ignoring webhook");
    return res.status(200).json({ received: true });
  }
  if (!sig) {
    return res
      .status(400)
      .json({ error: { message: "Missing stripe-signature" } });
  }
  let event: any;
  try {
    // @ts-ignore - body is a Buffer thanks to bodyParser.raw in app.ts
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.STRIPE_WEBHOOK_SECRET_CONNECTED
      );
    } catch (error) {
      logger.warn({ err }, "Invalid Stripe signature");
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated": {
        // Authorization created for manual capture flows
        const pi = event.data.object as any;
        const paylinkId = pi?.metadata?.paylinkId as string | undefined;
        if (!paylinkId) break;
        const link = await prisma.payLink.findUnique({
          where: { id: paylinkId },
          select: { id: true, userId: true, currency: true },
        });
        if (!link) break;
        const amountMinor = (pi?.amount as number) ?? 0;
        await prisma.transaction.upsert({
          where: { stripePaymentIntentId: pi.id as string },
          update: { status: "UNCAPTURED" },
          create: {
            userId: link.userId,
            payLinkId: link.id,
            amount: amountMinor,
            currency: (link.currency || "RON").toUpperCase(),
            status: "UNCAPTURED",
            stripePaymentIntentId: pi.id as string,
            description: pi?.description || null,
          },
        });
        break;
      }
      case "payment_intent.requires_action": {
        const pi = event.data.object as any;
        const paylinkId = pi?.metadata?.paylinkId as string | undefined;
        if (!paylinkId) break;
        const link = await prisma.payLink.findUnique({
          where: { id: paylinkId },
          select: { id: true, userId: true, currency: true },
        });
        if (!link) break;
        const amountMinor = (pi?.amount as number) ?? 0;
        await prisma.transaction.upsert({
          where: { stripePaymentIntentId: pi.id as string },
          update: { status: "REQUIRES_ACTION" },
          create: {
            userId: link.userId,
            payLinkId: link.id,
            amount: amountMinor,
            currency: (link.currency || "RON").toUpperCase(),
            status: "REQUIRES_ACTION",
            stripePaymentIntentId: pi.id as string,
            description: pi?.description || null,
          },
        });
        break;
      }
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;

        const paylinkId = pi?.metadata?.paylinkId as string | undefined;
        const amountMinor = (pi?.amount as number) ?? 0; // minor units

        if (!paylinkId) break;

        // Load link with minimal related data
        const link = await prisma.payLink.findUnique({
          where: { id: paylinkId },
          select: {
            id: true,
            name: true,
            serviceType: true,
            user: { select: { email: true } },
            fundraising: { select: { currentRaised: true } },
            product: { select: { assets: true, name: true } },
          },
        });
        if (!link) break;

        // 1) Fundraising: increment raised total (best-effort, no idempotency store yet)
        if (link.serviceType === "FUNDRAISING") {
          const current = link.fundraising?.currentRaised ?? 0;
          const next = current + amountMinor;
          await prisma.fundraisingCampaign.update({
            where: { payLinkId: link.id },
            data: { currentRaised: next },
          });
        }

        // Email/fulfillment happens in charge.succeeded to avoid duplication
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const paylinkId = pi?.metadata?.paylinkId as string | undefined;
        if (!paylinkId) break;

        const link = await prisma.payLink.findUnique({
          where: { id: paylinkId },
          select: { id: true, userId: true, currency: true },
        });
        if (!link) break;

        const failure = pi?.last_payment_error;
        const amountMinor = (pi?.amount as number) ?? 0;

        // Upsert by PI to be idempotent
        await prisma.transaction.upsert({
          where: { stripePaymentIntentId: pi.id as string },
          update: {
            status: "FAILED",
            failureCode: failure?.code || null,
            failureMessage: failure?.message || null,
          },
          create: {
            userId: link.userId,
            payLinkId: link.id,
            amount: amountMinor,
            currency: (link.currency || "RON").toUpperCase(),
            status: "FAILED",
            stripePaymentIntentId: pi.id as string,
            description: pi?.description || null,
          },
        });
        break;
      }
      case "account.updated": {
        const account = event.data.object as {
          id: string;
          controller?: any;
          details_submitted?: boolean;
          charges_enabled?: boolean;
          payouts_enabled?: boolean;
        };
        // Our User model stores stripeAccountId. Map back to user by that field.
        const user = await prisma.user.findFirst({
          where: { stripeAccountId: account.id },
          select: { id: true },
        });
        if (!user) break;

        const isOnboarded = !!(
          account.details_submitted || (account as any).charges_enabled
        );
        await prisma.user.update({
          where: { id: user.id },
          data: {
            onboardedAt: isOnboarded ? new Date() : undefined,
            stripeAccountStatusJson: JSON.stringify({
              details_submitted: (account as any).details_submitted,
              charges_enabled: (account as any).charges_enabled,
              payouts_enabled: (account as any).payouts_enabled,
              updated_at: new Date().toISOString(),
            }),
          },
        });
        break;
      }
      case "charge.succeeded": {
        const charge = event.data.object as any;
        console.log(charge);

        let paylinkId = charge?.metadata?.paylinkId as string | undefined;
        const amountMinor = (charge?.amount as number) ?? 0;
        const recipient =
          (charge?.billing_details?.email as string | undefined) ||
          (charge?.receipt_email as string | undefined) ||
          null;
        if (!paylinkId) {
          try {
            const piId = charge?.payment_intent as string | undefined;
            if (piId) {
              const pi = await getStripe().paymentIntents.retrieve(piId);
              paylinkId = (pi as any)?.metadata?.paylinkId as
                | string
                | undefined;
            }
          } catch (err) {
            logger.warn({ err }, "Failed to retrieve PI for charge metadata");
          }
        }
        if (!paylinkId || !recipient) break;

        const link = await prisma.payLink.findUnique({
          where: { id: paylinkId },
          select: {
            id: true,
            name: true,
            serviceType: true,
            userId: true,
            currency: true,
            collectEmail: true,
            collectPhone: true,
            collectBillingAddress: true,
            product: { select: { assets: true, name: true } },
          },
        });
        if (!link) break;

        // Optionally create/update a Customer record depending on collect flags
        let customerId: string | null = null;
        try {
          const bd = (charge?.billing_details || {}) as any;
          const wantEmail = !!link.collectEmail;
          const wantPhone = !!link.collectPhone;
          const wantAddr = !!link.collectBillingAddress;
          const hasEmail = !!bd.email;
          const hasPhone = !!bd.phone;
          const addr = bd.address || {};
          const hasAddr = !!addr?.line1;
          if (
            (wantEmail && hasEmail) ||
            (wantPhone && hasPhone) ||
            (wantAddr && hasAddr)
          ) {
            // Try to find by email first, then phone
            let existing = null as any;
            if (hasEmail) {
              existing = await prisma.customer.findFirst({
                where: { userId: link.userId, email: bd.email as string },
                select: { id: true },
              });
            }
            if (!existing && hasPhone) {
              existing = await prisma.customer.findFirst({
                where: { userId: link.userId, phone: bd.phone as string },
                select: { id: true },
              });
            }
            if (existing) {
              const updated = await prisma.customer.update({
                where: { id: existing.id },
                data: {
                  email: wantEmail ? (bd.email as string | null) : undefined,
                  phone: wantPhone ? (bd.phone as string | null) : undefined,
                  name: (bd.name as string | null) ?? undefined,
                  addressLine1: wantAddr
                    ? (addr.line1 as string | null)
                    : undefined,
                  addressLine2: wantAddr
                    ? (addr.line2 as string | null)
                    : undefined,
                  city: wantAddr ? (addr.city as string | null) : undefined,
                  postalCode: wantAddr
                    ? (addr.postal_code as string | null)
                    : undefined,
                  state: wantAddr ? (addr.state as string | null) : undefined,
                  country: wantAddr
                    ? (addr.country as string | null)
                    : undefined,
                },
              });
              customerId = updated.id;
            } else {
              const created = await prisma.customer.create({
                data: {
                  userId: link.userId,
                  email: wantEmail ? (bd.email as string | null) : null,
                  phone: wantPhone ? (bd.phone as string | null) : null,
                  name: (bd.name as string | null) ?? null,
                  addressLine1: wantAddr ? (addr.line1 as string | null) : null,
                  addressLine2: wantAddr ? (addr.line2 as string | null) : null,
                  city: wantAddr ? (addr.city as string | null) : null,
                  postalCode: wantAddr
                    ? (addr.postal_code as string | null)
                    : null,
                  state: wantAddr ? (addr.state as string | null) : null,
                  country: wantAddr ? (addr.country as string | null) : null,
                },
                select: { id: true },
              });
              customerId = created.id;
            }
          }
        } catch (err) {
          logger.warn({ err }, "Failed to upsert Customer from charge");
        }

        // Create/Upsert Transaction for this charge
        try {
          const pm = (charge?.payment_method_details || {}) as any;
          const pmType = pm?.type as string | undefined;
          const card = pm?.card || {};
          await prisma.transaction.upsert({
            where: { stripeChargeId: charge.id as string },
            update: {
              status: "SUCCEEDED",
              receiptUrl: (charge?.receipt_url as string | undefined) || null,
              description: (charge?.description as string | undefined) || null,
              refundedAmount:
                (charge?.amount_refunded as number | undefined) || 0,
            },
            create: {
              userId: link.userId,
              payLinkId: link.id,
              customerId: customerId || undefined,
              amount: amountMinor,
              currency: (link.currency || "RON").toUpperCase(),
              status: "SUCCEEDED",
              stripePaymentIntentId:
                (charge?.payment_intent as string | undefined) || null,
              stripeChargeId: charge.id as string,
              paymentMethodType: pmType || null,
              cardBrand: (card?.brand as string | undefined) || null,
              cardLast4: (card?.last4 as string | undefined) || null,
              description: (charge?.description as string | undefined) || null,
              receiptUrl: (charge?.receipt_url as string | undefined) || null,
            },
          });
        } catch (err) {
          logger.warn({ err }, "Failed to upsert Transaction for charge");
        }

        let extraHtml = "";
        if (link.serviceType === "DIGITAL_PRODUCT") {
          const raw = link.product?.assets as any;
          const items: { key: string; name?: string }[] = [];
          if (Array.isArray(raw)) {
            for (const it of raw) {
              if (typeof it === "string") items.push({ key: it });
              else if (it && typeof it === "object") {
                if (typeof it.key === "string")
                  items.push({ key: it.key, name: (it as any).name });
                else if (typeof (it as any).r2Key === "string")
                  items.push({
                    key: (it as any).r2Key,
                    name: (it as any).name,
                  });
              }
            }
          }
          if (items.length) {
            const links = await Promise.all(
              items.map(async (it) => ({
                url: await presignGetUrl({
                  key: it.key,
                  expiresInSeconds: 60 * 60 * 24,
                }),
                name: it.name || it.key.split("/").pop() || "Download",
              }))
            );
            extraHtml = `
              <p>Your downloads (valid for 24 hours):</p>
              <ul>
                ${links
                  .map((l) => `<li><a href="${l.url}">${l.name}</a></li>`)
                  .join("")}
              </ul>
            `;
          }
        }

        const subject = `Payment received — ${link.name}`;
        const amountRON = (amountMinor / 100).toFixed(2);
        const html = `
          <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
            <h2>Thank you!</h2>
            <p>We received your payment of <strong>${amountRON} RON</strong> for <strong>${link.name}</strong>.</p>
            ${extraHtml}
            <p style="color:#64748b; font-size: 12px; margin-top: 24px;">If you have questions, just reply to this email.</p>
          </div>
        `;
        try {
          await sendMail({ to: recipient, subject, html });
        } catch (err) {
          logger.warn(
            { err, recipient },
            "Failed to send confirmation email (charge)"
          );
        }
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as any;
        try {
          const refundedAmount = (charge?.amount_refunded as number) ?? null;
          await prisma.transaction.updateMany({
            where: { stripeChargeId: charge.id as string },
            data: {
              status: "REFUNDED",
              refundedAmount: refundedAmount ?? undefined,
              refundedAt: new Date(),
            },
          });
        } catch (err) {
          logger.warn({ err }, "Failed to mark transaction as refunded");
        }
        break;
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as any;
        try {
          await prisma.transaction.updateMany({
            where: { stripeChargeId: dispute.charge as string },
            data: { status: "DISPUTED" },
          });
        } catch (err) {
          logger.warn({ err }, "Failed to mark transaction as disputed");
        }
        break;
      }
      default:
        // ignore
        break;
    }
  } catch (err) {
    logger.error({ err, type: event?.type }, "Error handling Stripe webhook");
    return res
      .status(500)
      .json({ error: { message: "Webhook handler error" } });
  }

  res.json({ received: true });
}
