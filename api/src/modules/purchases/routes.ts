import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listPurchasesCtrl, presignDownloadCtrl } from "./controller.js";
import { listPurchasesSchema, presignDownloadSchema } from "./schemas.js";

export const router = Router();

router.get(
  "/",
  requireAuth,
  validate(listPurchasesSchema, "query"),
  listPurchasesCtrl
);
router.post(
  "/presign",
  requireAuth,
  validate(presignDownloadSchema, "body"),
  presignDownloadCtrl
);

export default router;
