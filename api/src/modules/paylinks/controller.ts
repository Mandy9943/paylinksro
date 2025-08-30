import { type NextFunction, type Response } from "express";
import {
  BANI,
  FEES,
  calcBaseApplicationFeeMinor,
  minTransactionMinor,
  monthStartUTC,
  monthlyFeeMinor,
} from "../../config/fees.js";
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
  duplicatePayLink,
  findPublicPayLinkBySlug,
  listPayLinks,
  updatePayLink,
} from "./service.js";

const toRON = BANI.toRON;
const toBani = BANI.fromRON;

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
    // Validate minimum amount at API level as well
    if (parsed.priceType === "FIXED") {
      if ((parsed.amount ?? 0) * 100 < minTransactionMinor()) {
        return res
          .status(400)
          .json({
            error: {
              message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
            },
          });
      }
    } else if (parsed.priceType === "FLEXIBLE") {
      const minA = (parsed as any).minAmount ?? 0;
      if (minA && minA * 100 < minTransactionMinor()) {
        return res
          .status(400)
          .json({
            error: {
              message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
            },
          });
      }
    }
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
    // Validate minimum amount on update if provided
    if (
      parsed.priceType === "FIXED" &&
      typeof (parsed as any).amount === "number"
    ) {
      if ((parsed as any).amount * 100 < minTransactionMinor()) {
        return res
          .status(400)
          .json({
            error: {
              message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
            },
          });
      }
    }
    if (
      parsed.priceType === "FLEXIBLE" &&
      typeof (parsed as any).minAmount === "number" &&
      (parsed as any).minAmount! > 0 &&
      (parsed as any).minAmount! * 100 < minTransactionMinor()
    ) {
      return res
        .status(400)
        .json({
          error: {
            message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
          },
        });
    }
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

export async function duplicateCtrl(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const created: any = await duplicatePayLink(req.user.id, id);
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

    const data = {
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
    };

    res.json(data);
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
    // Enforce global minimum
    if ((amountMinor ?? 0) < minTransactionMinor()) {
      return res
        .status(400)
        .json({
          error: {
            message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
          },
        });
    }
    // Compute base application fee (percent + fixed tiered)
    const baseFee = calcBaseApplicationFeeMinor(amountMinor!);
    // Add monthly active fee (charge once per month per seller, allow partial across tx)
    const mStart = monthStartUTC(new Date());
    const accrual = await prisma.monthlyFeeAccrual.findUnique({
      where: { userId_month: { userId: link.userId, month: mStart } as any },
      select: { id: true, collected: true },
    });
    const monthlyTarget = monthlyFeeMinor();
    const already = accrual?.collected ?? 0;
    const remaining = Math.max(0, monthlyTarget - already);
    const capForMonthly = Math.max(0, amountMinor! - baseFee);
    const monthlyToCharge = Math.min(remaining, capForMonthly); // ensure app fee <= amount
    const applicationFeeAmount = baseFee + monthlyToCharge;
    // Create a destination charge on the platform account and transfer funds to the seller
    const intent = await stripe.paymentIntents.create({
      amount: amountMinor!,
      currency,
      receipt_email: body.email,
      automatic_payment_methods: { enabled: true },
      application_fee_amount: applicationFeeAmount,
      transfer_data: { destination: accountId },
      on_behalf_of: accountId,
      metadata: {
        paylinkId: link.id,
        slug: link.slug,
        appFeeBase: String(baseFee),
        appFeeMonthly: String(monthlyToCharge),
      },
    });
    res.json({ client_secret: intent.client_secret });
  } catch (err) {
    next(err);
  }
}
