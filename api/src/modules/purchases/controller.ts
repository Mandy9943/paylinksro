import { NextFunction, Response } from "express";
import { listPurchasesForEmail, presignDownloadForBuyer } from "./service.js";

export async function listPurchasesCtrl(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.user?.email as string;
    const items = await listPurchasesForEmail(email);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function presignDownloadCtrl(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const email = req.user?.email as string;
    const { payLinkId, key } = req.validated?.body ?? req.body;
    const result = await presignDownloadForBuyer(email, { payLinkId, key });
    if (!result)
      return res.status(404).json({ error: { message: "Not found" } });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
