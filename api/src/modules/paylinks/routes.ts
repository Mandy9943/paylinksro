import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createCtrl,
  deleteCtrl,
  listCtrl,
  publicCreatePaymentIntentCtrl,
  publicGetBySlugCtrl,
  updateCtrl,
} from "./controller.js";
import { createPayLinkSchema, updatePayLinkSchema } from "./schemas.js";

export const payLinksRouter = Router();

// Public endpoint to fetch by slug
payLinksRouter.get("/public/:slug", publicGetBySlugCtrl);
payLinksRouter.post(
  "/public/:slug/payment-intents",
  publicCreatePaymentIntentCtrl
);

payLinksRouter.use(requireAuth);

payLinksRouter.get("/", listCtrl);
payLinksRouter.post("/", validate(createPayLinkSchema), createCtrl);
payLinksRouter.patch("/:id", validate(updatePayLinkSchema), updateCtrl);
payLinksRouter.delete("/:id", deleteCtrl);
