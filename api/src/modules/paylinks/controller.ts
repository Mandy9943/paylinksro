import { type NextFunction, type Response } from "express";
import {
  createPayLinkSchema,
  listQuerySchema,
  updatePayLinkSchema,
} from "./schemas.js";
import {
  createPayLink,
  deletePayLink,
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
