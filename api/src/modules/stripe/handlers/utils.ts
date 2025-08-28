import { logger } from "../../../lib/logger.js";
import { prisma } from "../../../lib/prisma.js";
import { getStripe } from "../../../lib/stripe.js";

export async function findPayLinkBasic(paylinkId: string) {
  return prisma.payLink.findUnique({
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
      fundraising: { select: { currentRaised: true } },
      product: { select: { assets: true, name: true } },
    },
  });
}

export async function incrementFundraisingIfNeeded(
  link: any,
  amountMinor: number
) {
  if (link?.serviceType !== "FUNDRAISING") return;
  const current = link.fundraising?.currentRaised ?? 0;
  const next = current + (amountMinor || 0);
  await prisma.fundraisingCampaign.update({
    where: { payLinkId: link.id },
    data: { currentRaised: next },
  });
}

export async function upsertCustomerFromCharge(link: any, charge: any) {
  const bd = (charge?.billing_details || {}) as any;
  const wantEmail = !!link.collectEmail;
  const wantPhone = !!link.collectPhone;
  const wantAddr = !!link.collectBillingAddress;
  const hasEmail = !!bd.email;
  const hasPhone = !!bd.phone;
  const addr = bd.address || {};
  const hasAddr = !!addr?.line1;
  if (
    !(
      (wantEmail && hasEmail) ||
      (wantPhone && hasPhone) ||
      (wantAddr && hasAddr)
    )
  ) {
    return null;
  }
  // Try to find by email first, then phone
  let existing: { id: string } | null = null;
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
        addressLine1: wantAddr ? (addr.line1 as string | null) : undefined,
        addressLine2: wantAddr ? (addr.line2 as string | null) : undefined,
        city: wantAddr ? (addr.city as string | null) : undefined,
        postalCode: wantAddr ? (addr.postal_code as string | null) : undefined,
        state: wantAddr ? (addr.state as string | null) : undefined,
        country: wantAddr ? (addr.country as string | null) : undefined,
      },
    });
    return updated.id;
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
        postalCode: wantAddr ? (addr.postal_code as string | null) : null,
        state: wantAddr ? (addr.state as string | null) : null,
        country: wantAddr ? (addr.country as string | null) : null,
      },
      select: { id: true },
    });
    return created.id;
  }
}

export async function upsertTransactionFromPI(
  link: any,
  pi: any,
  status: "FAILED" | "UNCAPTURED" | "REQUIRES_ACTION"
) {
  const amountMinor = (pi?.amount as number) ?? 0;
  await prisma.transaction.upsert({
    where: { stripePaymentIntentId: pi.id as string },
    update: { status },
    create: {
      userId: link.userId,
      payLinkId: link.id,
      amount: amountMinor,
      currency: (link.currency || "RON").toUpperCase(),
      status,
      stripePaymentIntentId: pi.id as string,
      description: pi?.description || null,
    },
  });
}

export async function upsertTransactionFromCharge(
  link: any,
  charge: any,
  amountMinor: number,
  customerId: string | null
) {
  const pm = (charge?.payment_method_details || {}) as any;
  const pmType = pm?.type as string | undefined;
  const card = pm?.card || {};
  await prisma.transaction.upsert({
    where: { stripeChargeId: charge.id as string },
    update: {
      status: "SUCCEEDED",
      receiptUrl: (charge?.receipt_url as string | undefined) || null,
      description: (charge?.description as string | undefined) || null,
      refundedAmount: (charge?.amount_refunded as number | undefined) || 0,
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
}

export async function retrievePIIfNeeded(charge: any) {
  try {
    const piId = charge?.payment_intent as string | undefined;
    if (!piId) return null;
    return await getStripe().paymentIntents.retrieve(piId);
  } catch (err) {
    logger.warn({ err }, "Failed to retrieve PI for charge metadata");
    return null;
  }
}
