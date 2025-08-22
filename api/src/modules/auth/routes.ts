import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requestLinkHandler, verifyLinkHandler } from "./controller.js";
import { RequestMagicLinkSchema, VerifyMagicLinkSchema } from "./schemas.js";

export const authRouter = Router();

authRouter.post(
  "/request",
  validate(RequestMagicLinkSchema),
  requestLinkHandler
);

authRouter.get(
  "/verify",
  validate(VerifyMagicLinkSchema, "query"),
  verifyLinkHandler
);
