import type { Request, Response } from "express";
import { RangeQuerySchema } from "./schemas.js";
import {
  getPaymentMethods,
  getRevenueSeries,
  getSummary,
  reconcileUserWindow,
} from "./service.js";

export async function summaryHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const { from, to } = RangeQuerySchema.parse(req.query);
  const data = await getSummary(auth.id, from, to);
  res.json({ summary: data });
}

export async function revenueHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const { from, to, interval } = RangeQuerySchema.parse(req.query);
  const series = await getRevenueSeries(
    auth.id,
    (interval as any) || "day",
    from,
    to
  );
  res.json({ series });
}

export async function paymentMethodsHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const { from, to } = RangeQuerySchema.parse(req.query);
  const items = await getPaymentMethods(auth.id, from, to);
  res.json({ items });
}

export async function reconcileHandler(req: Request, res: Response) {
  const auth = (req as any).user as { id: string };
  const { from, to } = RangeQuerySchema.parse(req.query);
  const result = await reconcileUserWindow(auth.id, from, to);
  res.json({ ok: true, ...result });
}
