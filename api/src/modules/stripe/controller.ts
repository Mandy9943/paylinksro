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
  createProductOnConnected,
  ensureUserConnectedAccount,
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
