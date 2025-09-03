import type { Response } from "express";
import {
  adminListPayouts,
  adminSetPayoutStatus,
  getMyAffiliateSummary,
  listMyCommissions,
  listMyReferrals,
  releasePendingHoldsJob,
  requestPayoutAllAvailable,
} from "./service.js";

export async function getMeSummaryHandler(req: any, res: Response) {
  const data = await getMyAffiliateSummary(req.user.id);
  res.json(data);
}

export async function listMyCommissionsHandler(req: any, res: Response) {
  const { status, cursor, limit } = (req as any).validated?.query || {};
  const data = await listMyCommissions(req.user.id, status, cursor, limit);
  res.json({ items: data });
}

export async function listMyReferralsHandler(req: any, res: Response) {
  const { cursor, limit } = (req as any).validated?.query || {};
  const data = await listMyReferrals(req.user.id, cursor, limit);
  res.json({ items: data });
}

export async function requestPayoutHandler(req: any, res: Response) {
  const { bankDetails } = (req as any).validated?.body || {};
  const payout = await requestPayoutAllAvailable(req.user.id, bankDetails);
  res.json({ payoutId: payout.id });
}

export async function releaseHoldsHandler(_req: any, res: Response) {
  const result = await releasePendingHoldsJob();
  res.json(result);
}

export async function adminListPayoutsHandler(req: any, res: Response) {
  const { status, affiliateId, cursor, limit } = req.query as any;
  const items = await adminListPayouts(
    status as any,
    affiliateId as any,
    cursor as any,
    limit ? parseInt(limit as string, 10) : undefined
  );
  res.json({ items });
}

export async function adminSetPayoutStatusHandler(req: any, res: Response) {
  const { id } = req.params as any;
  const { status, proofUrl } = req.body as any;
  if (!status || (status !== "SENT" && status !== "FAILED")) {
    return res.status(400).json({ error: { message: "Invalid status" } });
  }
  const result = await adminSetPayoutStatus(id, status, proofUrl);
  res.json(result);
}
