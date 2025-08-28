import { type NextFunction, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";
import {
  createPayLinkSchema,
  createPublicPaymentIntentSchema,
  listQuerySchema,
  updatePayLinkSchema,
} from "./schemas.js";
import {
  createPayLink,
  deletePayLink,
  findPublicPayLinkBySlug,
  listPayLinks,
  updatePayLink,
} from "./service.js";

function toRON(amount?: number | null) {
  if (amount == null) return null;
  return amount / 100;
}

function toBani(amount?: number | null) {
  if (amount == null) return undefined;
  return Math.round(amount * 100);
}

export async function listCtrl(req: any, res: Response, next: NextFunction) {
  try {
    const { cursor, limit } = listQuerySchema.parse(req.query);
    const items = await listPayLinks(req.user.id, limit ?? 50, cursor);
    res.json({
      items: items.map((p: any) => ({
        ...p,
        amount: toRON(p.amount),
        minAmount: toRON((p as any).minAmount),
        fundraising: p.fundraising
          ? {
              ...p.fundraising,
              targetAmount: toRON(p.fundraising.targetAmount),
              currentRaised: toRON(p.fundraising.currentRaised),
            }
          : null,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function createCtrl(req: any, res: Response, next: NextFunction) {
  try {
    const parsed = createPayLinkSchema.parse(req.validated?.body ?? req.body);
    const created = await createPayLink(req.user.id, {
      ...parsed,
      amount:
        parsed.priceType === "FIXED"
          ? toBani(parsed.amount ?? null)
          : undefined,
      minAmount:
        parsed.priceType === "FLEXIBLE"
          ? toBani((parsed as any).minAmount ?? null)
          : undefined,
      fundraising: parsed.fundraising
        ? {
            ...parsed.fundraising,
            targetAmount: toBani(
              parsed.fundraising.targetAmount ?? null
            ) as any,
          }
        : undefined,
    } as any);
    res.status(201).json({
      ...created,
      amount: toRON(created.amount),
      minAmount: toRON((created as any).minAmount),
      fundraising: created.fundraising
        ? {
            ...created.fundraising,
            targetAmount: toRON(created.fundraising.targetAmount),
            currentRaised: toRON(created.fundraising.currentRaised),
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCtrl(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const parsed = updatePayLinkSchema.parse(req.validated?.body ?? req.body);
    const updated = await updatePayLink(req.user.id, id, {
      ...parsed,
      amount:
        parsed.priceType === "FIXED"
          ? toBani((parsed as any).amount ?? null)
          : undefined,
      minAmount:
        parsed.priceType === "FLEXIBLE"
          ? toBani((parsed as any).minAmount ?? null)
          : undefined,
      fundraising: parsed.fundraising
        ? {
            ...parsed.fundraising,
            targetAmount: toBani(
              parsed.fundraising.targetAmount ?? null
            ) as any,
          }
        : undefined,
    } as any);
    res.json({
      ...updated,
      amount: toRON(updated.amount),
      minAmount: toRON((updated as any).minAmount),
      fundraising: updated.fundraising
        ? {
            ...updated.fundraising,
            targetAmount: toRON(updated.fundraising.targetAmount),
            currentRaised: toRON(updated.fundraising.currentRaised),
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCtrl(req: any, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await deletePayLink(req.user.id, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function publicGetBySlugCtrl(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params as { slug: string };
    const p: any = await findPublicPayLinkBySlug(slug);
    if (!p || !p.active) {
      return res.status(404).json({ error: { message: "Not found" } });
    }
    // Get seller's connected account id so clients can initialize Stripe.js
    const owner = await prisma.user.findUnique({
      where: { id: p.userId },
      select: { stripeAccountId: true, onboardedAt: true },
    });
    res.json({
      ...p,
      amount: toRON(p.amount),
      minAmount: toRON((p as any).minAmount),
      sellerStripeAccountId: owner?.stripeAccountId ?? null,
      sellerOnboarded: owner?.onboardedAt ? true : false,
      fundraising: p.fundraising
        ? {
            ...p.fundraising,
            targetAmount: toRON(p.fundraising.targetAmount),
            currentRaised: toRON(p.fundraising.currentRaised),
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function publicCreatePaymentIntentCtrl(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { slug } = req.params as { slug: string };
    const body = createPublicPaymentIntentSchema.parse(
      req.validated?.body ?? req.body
    );
    const link: any = await findPublicPayLinkBySlug(slug);
    if (!link || !link.active) {
      return res.status(404).json({ error: { message: "Not found" } });
    }
    const owner = await prisma.user.findUnique({
      where: { id: link.userId },
      select: { stripeAccountId: true, onboardedAt: true },
    });
    const accountId = (owner as any)?.stripeAccountId as string | undefined;
    const onboarded = !!(owner as any)?.onboardedAt;
    if (!accountId || !onboarded) {
      return res
        .status(400)
        .json({ error: { message: "Seller not onboarded" } });
    }
    const stripe = getStripe();
    const currency = (link.currency as string)?.toLowerCase() || "ron";
    let amountMinor: number | null = null;
    if (link.priceType === "FIXED") {
      amountMinor = link.amount as number; // in minor units
    } else {
      if (typeof body.amount !== "number") {
        return res.status(400).json({ error: { message: "Missing amount" } });
      }
      amountMinor = Math.max(0, Math.round((body.amount as number) * 100));
      const minMinor = (link.minAmount as number) ?? 0;
      if (minMinor && amountMinor < minMinor) {
        return res
          .status(400)
          .json({ error: { message: "Amount below minimum" } });
      }
    }
    const applicationFeeAmount = Math.floor((amountMinor ?? 0) * 0.1);
    // Create a destination charge on the platform account and transfer funds to the seller
    const intent = await stripe.paymentIntents.create({
      amount: amountMinor!,
      currency,
      receipt_email: body.email,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: applicationFeeAmount,
      transfer_data: { destination: accountId },
      on_behalf_of: accountId,
      metadata: { paylinkId: link.id, slug: link.slug },
    });
    res.json({ client_secret: intent.client_secret });
  } catch (err) {
    next(err);
  }
}
