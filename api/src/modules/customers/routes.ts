import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { listCustomersCtrl } from "./controller.js";
import { listCustomersQuerySchema } from "./schemas.js";

export const customersRouter = Router();

customersRouter.get(
  "/",
  requireAuth,
  validate(listCustomersQuerySchema, "query"),
  listCustomersCtrl
);
