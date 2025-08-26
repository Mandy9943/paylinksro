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
      items: items.map((p: any) => ({ ...p, amount: toRON(p.amount) })),
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
    } as any);
    res.status(201).json({ ...created, amount: toRON(created.amount) });
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
    } as any);
    res.json({ ...updated, amount: toRON(updated.amount) });
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
