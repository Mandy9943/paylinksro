import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  paymentMethodsHandler,
  reconcileHandler,
  revenueHandler,
  summaryHandler,
} from "./controller.js";

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth);
analyticsRouter.get("/summary", summaryHandler);
analyticsRouter.get("/revenue", revenueHandler);
analyticsRouter.get("/payment-methods", paymentMethodsHandler);
analyticsRouter.post("/reconcile", reconcileHandler);
