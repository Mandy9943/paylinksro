import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  downloadUrlController,
  presignUploadController,
  listLogosController,
} from "./controller.js";
import { getDownloadSchema, getPresignSchema } from "./schemas.js";

export const uploadsRouter = Router();

uploadsRouter.post(
  "/presign",
  requireAuth,
  validate(getPresignSchema),
  presignUploadController
);
uploadsRouter.post(
  "/download-url",
  requireAuth,
  validate(getDownloadSchema),
  downloadUrlController
);

uploadsRouter.get("/logos", requireAuth, listLogosController);
