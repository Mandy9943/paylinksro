import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { getPublishableKey } from "../../lib/stripe.js";
import { AuthedRequest } from "../../middleware/auth.js";
import {
  AccountIdParam,
  CreateAccountSessionBody,
  CreatePaymentIntentBody,
  CreateProductBody,
  ListProductsQuery,
} from "./schemas.js";
import {
  createAccountSession,
  createConnectedAccount,
  createPaymentIntentConnected,
  createPayoutOnConnected,
  createProductOnConnected,
  ensureUserConnectedAccount,
  getConnectedBalanceSummary,
  listPayoutsConnected,
  listProductsConnected,
  retrieveAccount,
} from "./service.js";

export async function createAccountHandler(req: AuthedRequest, res: Response) {
  if (!req.user?.id || !req.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const meta = {
    userId: req.user.id,
    email: req.user.email,
  };
  const account = await createConnectedAccount(meta);
  res.json({ id: account.id, account });
}

export async function getAccountHandler(req: Request, res: Response) {
  const { id } = (req as any).validated?.params as AccountIdParam;
  if (id === "me") {
    return res
      .status(400)
      .json({ error: { message: "Use /accounts/me for current user" } });
  }
  const account = await retrieveAccount(id);
  res.json({ account });
}

export async function createAccountSessionHandler(req: Request, res: Response) {
  const { id } = (req as any).validated?.params as AccountIdParam;
  const { component } = (req as any).validated
    ?.body as CreateAccountSessionBody;
  const session = await createAccountSession(id, component);
  res.json({ client_secret: session.client_secret });
}

export async function getPublishableKeyHandler(_req: Request, res: Response) {
  const pk = getPublishableKey();
  res.json({ publishableKey: pk });
}

export async function ensureMyAccountHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { id: true, email: true },
  });
  const { accountId, account } = await ensureUserConnectedAccount(
    dbUser!.id,
    dbUser!.email
  );
  res.json({ id: accountId, account });
}

export async function createProductHandler(req: Request, res: Response) {
  const { accountId, name, description, price, currency } = (req as any)
    .validated?.body as CreateProductBody;
  const unitAmount = Math.round(price * 100);
  const product = await createProductOnConnected(accountId, {
    name,
    description,
    unitAmount,
    currency: currency.toLowerCase(),
  });
  res.json({ product });
}

export async function listProductsHandler(req: Request, res: Response) {
  const { accountId } = (req as any).validated?.query as ListProductsQuery;
  const products = await listProductsConnected(accountId);
  res.json({ products });
}

export async function createPaymentIntentHandler(req: Request, res: Response) {
  const { accountId, priceId, quantity, applicationFeeAmount } = (req as any)
    .validated?.body as CreatePaymentIntentBody;
  const intent = await createPaymentIntentConnected(accountId, {
    priceId,
    quantity,
    applicationFeeAmount,
  });
  res.json({ client_secret: intent.client_secret });
}

export async function getMyBalanceHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { stripeAccountId: true },
  });
  const accountId = dbUser?.stripeAccountId;

  if (!accountId)
    return res.json({
      currency: "RON",
      available: 0,
      pending: 0,
      totalTransferred: 0,
    });
  const summary = await getConnectedBalanceSummary(accountId);
  const toMajor = (n: number) => Math.round((n / 100) * 100) / 100;
  res.json({
    currency: summary.currency,
    available: toMajor(summary.availableMinor),
    pending: toMajor(summary.pendingMinor),
    totalTransferred: toMajor(summary.totalTransferredMinor),
    processing: toMajor(summary.processingMinor || 0),
  });
}

export async function listMyPayoutsHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { stripeAccountId: true },
  });
  const accountId = dbUser?.stripeAccountId;
  if (!accountId) return res.json({ items: [], hasMore: false });

  const { limit, startingAfter } = ((req as any).validated?.query || {}) as {
    limit?: number;
    startingAfter?: string;
  };
  const items = await listPayoutsConnected(accountId, { limit, startingAfter });
  res.json({ items });
}

export async function createMyPayoutHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const dbUser = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { stripeAccountId: true, onboardedAt: true },
  });
  const accountId = dbUser?.stripeAccountId;
  if (!accountId)
    return res.status(400).json({ error: { message: "No connected account" } });

  // Verify account is onboarded and payouts enabled in Stripe
  try {
    const acct = await retrieveAccount(accountId);
    const payoutsEnabled = !!(acct as any).payouts_enabled;
    const detailsSubmitted = !!(acct as any).details_submitted;
    if (!payoutsEnabled || !detailsSubmitted || !dbUser?.onboardedAt) {
      return res
        .status(400)
        .json({ error: { message: "Account not onboarded for payouts" } });
    }
  } catch (e) {
    return res
      .status(400)
      .json({ error: { message: "Unable to verify account status" } });
  }

  const body = (req as any).validated?.body as {
    currency?: string;
    statementDescriptor?: string;
  };
  // Compute available from Stripe balance, enforce min 5 RON
  const summary = await getConnectedBalanceSummary(accountId);
  const availableMinor = summary.availableMinor;
  const pendingMinor = summary.pendingMinor;
  const MIN_MINOR = 5 * 100;
  if (!availableMinor || availableMinor < MIN_MINOR) {
    return res.status(400).json({
      error: {
        message: "Insufficient available balance for payout (min 5 RON)",
        code: "INSUFFICIENT_FUNDS",
        details: {
          availableMinor,
          available: Math.round((availableMinor / 100) * 100) / 100,
          pendingMinor,
          pending: Math.round((pendingMinor / 100) * 100) / 100,
          currency: summary.currency,
          minRequired: 5,
        },
      },
    });
  }
  const payout = await createPayoutOnConnected(accountId, {
    amountMinor: availableMinor,
    currency: body?.currency,
    statementDescriptor: body?.statementDescriptor,
  });
  res.json({ payout });
}
