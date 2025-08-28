import type { NextFunction, Request, Response } from "express";
import { listCustomersQuerySchema } from "./schemas.js";
import { listCustomersService } from "./service.js";

export async function listCustomersCtrl(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const q = listCustomersQuerySchema.parse(
      (req as any).validated?.query ?? req.query
    );
    const userId = (req as any).user?.id as string;
    const result = await listCustomersService({
      userId,
      segment: q.segment,
      limit: q.limit,
      cursor: q.cursor,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
