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
    logger.warn({ err }, "Invalid Stripe signature");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
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
            product: { select: { assets: true, name: true } },
          },
        });
        if (!link) break;

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
