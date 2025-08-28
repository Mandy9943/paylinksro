import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listTransactionsCtrl } from "./controller.js";
import { listTransactionsQuerySchema } from "./schemas.js";

export const transactionsRouter = Router();

transactionsRouter.get(
  "/",
  requireAuth,
  validate(listTransactionsQuerySchema, "query"),
  listTransactionsCtrl
);
