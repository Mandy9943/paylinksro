import { prisma } from "../../../lib/prisma.js";
import { presignGetUrl } from "../../../lib/r2.js";
import { sendMail } from "../../../services/mailer.js";
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
    const netMinor =
      typeof charge.transfer?.amount === "number"
        ? (charge.transfer.amount as number)
        : undefined;
    await prisma.transaction.updateMany({
      where: { stripeChargeId: charge.id as string },
      data: {
        createdAt,
        succeededAt,
        netAmount: netMinor ?? undefined,
      },
    });
  } catch {
    // ignore
  }

  // Digital product delivery in email (unchanged logic)
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
            items.push({ key: (it as any).r2Key, name: (it as any).name });
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
          name: it.name || it.key.split("/").pop() || "Descărcare",
        }))
      );
      extraHtml = `
        <p>Descărcările dvs. (valabile 24 de ore):</p>
        <ul>
          ${links
            .map((l) => `<li><a href="${l.url}">${l.name}</a></li>`)
            .join("")}
        </ul>
      `;
    }
  }

  // Respect user's email notification setting
  let shouldSendEmail = true;
  try {
    const pref = await prisma.userSettings.findUnique({
      where: { userId: link.userId },
      select: { emailNotifications: true },
    });
    shouldSendEmail = pref?.emailNotifications ?? true;
  } catch {
    // default stays true
  }

  if (recipient && shouldSendEmail) {
    const subject = `Plată primită — ${link.name}`;
    const amountRON = (amountMinor / 100).toFixed(2);
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;">
        <h2>Mulțumim!</h2>
        <p>Am primit plata de <strong>${amountRON} RON</strong> pentru <strong>${link.name}</strong>.</p>
        ${extraHtml}
        <p style="color:#64748b; font-size: 12px; margin-top: 24px;">Dacă aveți întrebări, răspundeți la acest email.</p>
      </div>
    `;
    try {
      await sendMail({ to: recipient, subject, html });
    } catch {
      // ignore
    }
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
}
