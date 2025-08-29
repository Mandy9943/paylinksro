import type Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";

export async function createConnectedAccount(meta: {
  userId: string;
  email: string;
}) {
  const stripe = getStripe();
  return stripe.accounts.create({
    email: meta.email,
    controller: {
      fees: {
        payer: "application",
      },
      losses: {
        payments: "application",
      },
      stripe_dashboard: {
        type: "none",
      },
      requirement_collection: "application",
    },
    country: "RO",
    capabilities: {
      card_payments: {
        requested: true,
      },
      transfers: {
        requested: true,
      },
    },

    metadata: meta,
  });
}

export async function retrieveAccount(accountId: string) {
  const stripe = getStripe();
  return stripe.accounts.retrieve(accountId);
}

export async function ensureUserConnectedAccount(
  userId: string,
  email?: string
) {
  // Read mapping from DB
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const mappedId = (user as any)?.stripeAccountId as string | undefined;
  if (mappedId) {
    const account = await retrieveAccount(mappedId);
    return { accountId: mappedId, account };
  }
  // Create and persist mapping
  const created = await createConnectedAccount({ userId, email: email ?? "" });
  await prisma.user.update({
    where: { id: userId },
    // Casting to any until prisma generate runs with the updated schema
    data: { stripeAccountId: created.id },
  });
  return { accountId: created.id, account: created };
}

export async function createAccountSession(
  accountId: string,
  component: "onboarding" | "management" | undefined
) {
  const stripe = getStripe();
  const componentsParam =
    component === "management"
      ? {
          account_management: { enabled: true },
          notification_banner: { enabled: true },
        }
      : { account_onboarding: { enabled: true } };
  return stripe.accountSessions.create({
    account: accountId,
    components: componentsParam as any,
  });
}

export async function createProductOnConnected(
  accountId: string,
  params: {
    name: string;
    description?: string;
    unitAmount: number;
    currency: string;
  }
) {
  const stripe = getStripe();
  return stripe.products.create(
    {
      name: params.name,
      description: params.description,
      default_price_data: {
        unit_amount: params.unitAmount,
        currency: params.currency,
      },
    },
    { stripeAccount: accountId }
  );
}

export async function listProductsConnected(accountId: string) {
  const stripe = getStripe();
  const products = await stripe.products.list(
    { active: true, expand: ["data.default_price"], limit: 100 },
    { stripeAccount: accountId }
  );
  return products.data;
}

export async function createPaymentIntentConnected(
  accountId: string,
  params: { priceId: string; quantity: number; applicationFeeAmount?: number }
) {
  const stripe = getStripe();
  const price = await stripe.prices.retrieve(params.priceId, {
    stripeAccount: accountId,
  });
  const unit = (price.unit_amount as number) ?? 0;
  const currency = (price.currency as string) ?? "usd";
  if (!unit)
    throw Object.assign(new Error("Price has no unit_amount"), { status: 400 });
  const amount = unit * params.quantity;
  const intent = await stripe.paymentIntents.create(
    {
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
      application_fee_amount:
        typeof params.applicationFeeAmount === "number"
          ? Math.max(0, Math.floor(params.applicationFeeAmount))
          : 123,
    },
    { stripeAccount: accountId }
  );
  return intent;
}

export async function getConnectedBalanceSummary(accountId: string) {
  const stripe = getStripe();
  const balance = await stripe.balance.retrieve({
    stripeAccount: accountId,
  } as any);
  console.log("getConnectedBalanceSummary balance", balance);

  const ronAvail = (balance.available || []).find(
    (b: any) => (b.currency || "").toLowerCase() === "ron"
  );
  const ronPending = (balance.pending || []).find(
    (b: any) => (b.currency || "").toLowerCase() === "ron"
  );
  // Sum payouts to date (limit pages for safety) and compute processing (pending/in_transit)
  let totalTransferredMinor = 0;
  let processingMinor = 0;
  let startingAfter: string | undefined = undefined;
  for (let i = 0; i < 3; i++) {
    const payouts: Stripe.ApiList<Stripe.Payout> = await stripe.payouts.list(
      { limit: 100, starting_after: startingAfter },
      { stripeAccount: accountId }
    );
    for (const p of payouts.data) {
      if ((p.currency || "").toLowerCase() !== "ron") continue;
      if (p.status === "paid") totalTransferredMinor += p.amount || 0;
      if (p.status === "pending" || p.status === "in_transit")
        processingMinor += p.amount || 0;
    }
    if (!payouts.has_more) break;
    startingAfter = payouts.data[payouts.data.length - 1]?.id;
    if (!startingAfter) break;
  }
  return {
    currency: "RON",
    availableMinor: ronAvail?.amount ?? 0,
    pendingMinor: ronPending?.amount ?? 0,
    totalTransferredMinor,
    processingMinor,
  };
}

export async function listPayoutsConnected(
  accountId: string,
  opts?: { limit?: number; startingAfter?: string }
) {
  const stripe = getStripe();
  const res = await stripe.payouts.list(
    { limit: opts?.limit ?? 50, starting_after: opts?.startingAfter },
    { stripeAccount: accountId }
  );
  return res.data
    .filter((p) => (p.currency || "").toLowerCase() === "ron")
    .map((p) => ({
      id: p.id,
      amountMinor: p.amount || 0,
      currency: (p.currency || "ron").toUpperCase(),
      status: p.status,
      created: p.created ? new Date(p.created * 1000) : null,
      arrivalDate: p.arrival_date ? new Date(p.arrival_date * 1000) : null,
      method: (p.method as string | undefined) || null,
      statementDescriptor: (p.statement_descriptor as string | undefined) || null,
    }));
}

export async function createPayoutOnConnected(
  accountId: string,
  params: { amountMinor: number; currency?: string; statementDescriptor?: string }
) {
  const stripe = getStripe();
  const currency = (params.currency || "ron").toLowerCase();
  if (currency !== "ron") {
    throw Object.assign(new Error("Unsupported currency"), { status: 400 });
  }
  const payout = await stripe.payouts.create(
    {
      amount: Math.max(1, Math.floor(params.amountMinor)),
      currency,
      statement_descriptor: params.statementDescriptor,
    } as any,
    { stripeAccount: accountId }
  );
  return payout;
}
