import type { NextFunction, Request, Response } from "express";
import { listTransactionsQuerySchema } from "./schemas.js";
import { listTransactionsService } from "./service.js";

export async function listTransactionsCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = listTransactionsQuerySchema.parse(
      (req as any).validated?.query ?? req.query
    );
    const userId = (req as any).user?.id as string;
    const result = await listTransactionsService({
      userId,
      status: q.status,
      limit: q.limit,
      cursor: q.cursor,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
