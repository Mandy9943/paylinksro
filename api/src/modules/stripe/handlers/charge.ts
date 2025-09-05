import { addDays } from "date-fns";
import { env } from "../../../config/env.js";
import {
  monthStartUTC,
  splitBaseApplicationFeeMinor,
} from "../../../config/fees.js";
import { prisma } from "../../../lib/prisma.js";
import { sendMail } from "../../../services/mailer.js";
import { createShortLivedLoginToken } from "../../auth/service.js";
import {
  findPayLinkBasic,
  retrievePIIfNeeded,
  upsertCustomerFromCharge,
  upsertTransactionFromCharge,
} from "./utils.js";

export async function onChargeSucceeded(event: any) {
  const charge = event.data.object as any;
  let paylinkId = charge?.metadata?.paylinkId as string | undefined;
  const amountMinor = (charge?.amount as number) ?? 0;
  const metaBase = parseInt(charge?.metadata?.appFeeBase ?? "0", 10) || 0;
  const metaMonthly = parseInt(charge?.metadata?.appFeeMonthly ?? "0", 10) || 0;
  const recipient =
    (charge?.billing_details?.email as string | undefined) ||
    (charge?.receipt_email as string | undefined) ||
    null;
  // Retrieve PI early to use metadata and timestamps
  const pi = await retrievePIIfNeeded(charge);
  if (!paylinkId) {
    paylinkId = (pi as any)?.metadata?.paylinkId as string | undefined;
  }
  // Proceed even if recipient is missing to ensure transactions are recorded
  if (!paylinkId) return;

  const link = await findPayLinkBasic(paylinkId);
  if (!link) return;

  let customerId: string | null = null;
  try {
    customerId = await upsertCustomerFromCharge(link, charge);
  } catch {
    // ignore but continue with transaction/email
  }
  try {
    await upsertTransactionFromCharge(link, charge, amountMinor, customerId);
    // Also update timestamps/net if available
    const succeededAt = charge.created
      ? new Date((charge.created as number) * 1000)
      : new Date();
    const createdAt = pi?.created
      ? new Date((pi.created as number) * 1000)
      : succeededAt;
    // Compute net to seller locally: amount - (base app fee percent + fixed + monthly portion)
    const split = splitBaseApplicationFeeMinor(amountMinor);
    const netMinor = Math.max(
      0,
      amountMinor - (split.percentMinor + split.fixedMinor + (metaMonthly || 0))
    );
    console.log("charge", charge);
    await prisma.transaction.updateMany({
      where: { stripeChargeId: charge.id as string },
      data: {
        createdAt,
        succeededAt,
        netAmount: netMinor,
        appFeePercent: split.percentMinor,
        appFeeFixed: split.fixedMinor,
        appFeeMonthly: metaMonthly || undefined,
      },
    });

    // Create affiliate commission if seller was referred
    try {
      if (netMinor > 0) {
        const tx = await prisma.transaction.findFirst({
          where: { stripeChargeId: charge.id as string },
          select: { id: true, userId: true },
        });
        if (tx) {
          const ref = await prisma.referral.findUnique({
            where: { referredUserId: tx.userId },
            select: { affiliateUserId: true, referredUserId: true },
          });
          if (ref) {
            const commissionAmount = Math.round(netMinor * 0.005);
            const holdReleaseAt = addDays(succeededAt, 14);
            // Create commission, unique on transactionId avoids dupes
            await prisma.commission
              .create({
                data: {
                  affiliateUserId: ref.affiliateUserId,
                  referredUserId: ref.referredUserId,
                  transactionId: tx.id,
                  amount: commissionAmount,
                  status: "PENDING",
                  holdReleaseAt,
                },
              })
              .catch(() => void 0);
          }
        }
      }
    } catch {
      // ignore commission failures to not break webhook
    }
    // Accrue the monthly active fee portion as collected for the current month
    if (metaMonthly > 0) {
      const now = new Date();
      const mStart = monthStartUTC(now);
      await prisma.monthlyFeeAccrual.upsert({
        where: { userId_month: { userId: link.userId, month: mStart } as any },
        update: {
          collected: { increment: metaMonthly },
          lastTransactionId: charge.id as string,
        },
        create: {
          userId: link.userId,
          month: mStart,
          collected: metaMonthly,
          lastTransactionId: charge.id as string,
        },
      });
    }
  } catch {
    // ignore
  }

  // Build deep-link for the buyer (auto-login + redirect to purchases)
  let purchasesDeepLink: string | null = null;
  if (recipient) {
    try {
      const shortToken = await createShortLivedLoginToken(recipient, 60 * 24); // 24h short token
      const verifyUrl = new URL("/api/v1/auth/verify", env.API_ORIGIN);
      verifyUrl.searchParams.set("token", shortToken);
      verifyUrl.searchParams.set(
        "redirectTo",
        new URL("/auth/callback", env.APP_ORIGIN).toString()
      );
      verifyUrl.searchParams.set("redirectToAfterAuth", "/dashboard/purchases");
      purchasesDeepLink = verifyUrl.toString();
    } catch {
      purchasesDeepLink = null;
    }
  }

  // Send buyer receipt email (always, if we have recipient)
  if (recipient) {
    const amountStr = `${(amountMinor / 100).toFixed(2)} ${(
      link.currency || "RON"
    ).toUpperCase()}`;
    const subject = `Plată procesată — ${link.name}`;
    const achizitii = purchasesDeepLink
      ? `<a href="${purchasesDeepLink}"><strong>Achizițiile mele</strong></a>`
      : `<strong>Achizițiile mele</strong>`;
    const extraForType =
      link.serviceType === "DIGITAL_PRODUCT"
        ? `<p>Poți descărca fișierele din ${achizitii}.</p>`
        : `<p>Găsești detaliile achiziției în ${achizitii}.</p>`;
    const deepLinkHtml = purchasesDeepLink
      ? `<p style="color:#64748b; font-size: 12px;">Linkul de autentificare expiră în 24 de ore.</p>`
      : "";
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
        <h2>Mulțumim!</h2>
        <p>Am procesat plata de <strong>${amountStr}</strong> pentru <strong>${link.name}</strong>.</p>
        ${extraForType}
        ${deepLinkHtml}
        <p style="color:#64748b; font-size: 12px; margin-top: 24px;">Dacă ai întrebări, răspunde la acest email.</p>
      </div>
    `;
    try {
      await sendMail({ to: recipient, subject, html });
    } catch {
      // ignore
    }
  }

  // Send seller notification (respect seller's email notification preference)
  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: link.userId },
      select: { emailNotifications: true },
    });
    const seller = await prisma.user.findUnique({
      where: { id: link.userId },
      select: { email: true },
    });
    const notifySeller =
      (settings?.emailNotifications ?? true) && !!seller?.email;
    if (notifySeller) {
      const amountStr = `${(amountMinor / 100).toFixed(2)} ${(
        link.currency || "RON"
      ).toUpperCase()}`;
      const buyerName =
        (charge?.billing_details?.name as string | undefined) || null;
      const buyerEmail =
        (charge?.billing_details?.email as string | undefined) || null;
      const subjectSeller = `Plată primită — ${link.name}`;
      const buyerLine =
        buyerName || buyerEmail
          ? `<p style="color:#475569; font-size: 12px;">De la: ${[
              buyerName,
              buyerEmail,
            ]
              .filter(Boolean)
              .join(" · ")}</p>`
          : "";
      const dashboardUrl = new URL(
        "/dashboard/transactions",
        env.APP_ORIGIN
      ).toString();
      const htmlSeller = `
        <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
          <h2>Plată primită</h2>
          <p>Ai primit o plată de <strong>${amountStr}</strong> pentru <strong>${link.name}</strong>.</p>
          ${buyerLine}
          <p style="color:#64748b; font-size: 12px; margin-top: 24px;">Poți vedea tranzacțiile în <a href="${dashboardUrl}"><strong>dashboard</strong></a>.</p>
        </div>
      `;
      await sendMail({
        to: seller.email!,
        subject: subjectSeller,
        html: htmlSeller,
      });
    }
  } catch {
    // ignore seller notification failures
  }
}

export async function onChargeRefunded(event: any) {
  const charge = event.data.object as any;
  const refundedAmount = (charge?.amount_refunded as number) ?? null;
  await prisma.transaction.updateMany({
    where: { stripeChargeId: charge.id as string },
    data: {
      status: "REFUNDED",
      refundedAmount: refundedAmount ?? undefined,
      refundedAt: new Date(),
    },
  });
  // Cancel commission if exists (unless paid which we leave per spec)
  try {
    const tx = await prisma.transaction.findFirst({
      where: { stripeChargeId: charge.id as string },
      select: { id: true },
    });
    if (tx) {
      await prisma.commission.updateMany({
        where: {
          transactionId: tx.id,
          status: { in: ["PENDING", "AVAILABLE", "ALLOCATED"] } as any,
        },
        data: { status: "CANCELED" },
      });
    }
  } catch {
    // ignore
  }
}

export async function onChargeDisputeCreated(event: any) {
  const dispute = event.data.object as any;
  const when = dispute.created
    ? new Date((dispute.created as number) * 1000)
    : new Date();
  await prisma.transaction.updateMany({
    where: { stripeChargeId: dispute.charge as string },
    data: {
      status: "DISPUTED",
      disputedAt: when,
      stripeDisputeId: (dispute.id as string) || undefined,
    },
  });
  // Cancel commission if exists (unless paid)
  try {
    const tx = await prisma.transaction.findFirst({
      where: { stripeChargeId: dispute.charge as string },
      select: { id: true },
    });
    if (tx) {
      await prisma.commission.updateMany({
        where: {
          transactionId: tx.id,
          status: { in: ["PENDING", "AVAILABLE", "ALLOCATED"] } as any,
        },
        data: { status: "CANCELED" },
      });
    }
  } catch {
    // ignore
  }
}
