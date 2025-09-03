import { Router } from "express";
import { requireAdmin, requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  adminListPayoutsHandler,
  adminSetPayoutStatusHandler,
  getMeSummaryHandler,
  listMyCommissionsHandler,
  listMyReferralsHandler,
  releaseHoldsHandler,
  requestPayoutHandler,
} from "./controller.js";
import { PaginationQuerySchema, PayoutRequestBodySchema } from "./schemas.js";

export const affiliatesRouter = Router();

// Me
affiliatesRouter.get("/me", requireAuth, getMeSummaryHandler);
affiliatesRouter.get(
  "/me/commissions",
  requireAuth,
  validate(PaginationQuerySchema, "query"),
  listMyCommissionsHandler
);
affiliatesRouter.get(
  "/me/referrals",
  requireAuth,
  validate(PaginationQuerySchema, "query"),
  listMyReferralsHandler
);
affiliatesRouter.post(
  "/payouts/request",
  requireAuth,
  validate(PayoutRequestBodySchema),
  requestPayoutHandler
);

// Admin
affiliatesRouter.post(
  "/admin/jobs/release-holds",
  requireAuth,
  requireAdmin,
  releaseHoldsHandler
);
affiliatesRouter.get(
  "/admin/payouts",
  requireAuth,
  requireAdmin,
  adminListPayoutsHandler
);
affiliatesRouter.patch(
  "/admin/payouts/:id",
  requireAuth,
  requireAdmin,
  adminSetPayoutStatusHandler
);

export default affiliatesRouter;
