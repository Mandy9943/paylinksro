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
