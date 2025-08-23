import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createAccountHandler,
  createAccountSessionHandler,
  createPaymentIntentHandler,
  createProductHandler,
  ensureMyAccountHandler,
  getAccountHandler,
  getPublishableKeyHandler,
  listProductsHandler,
} from "./controller.js";
import {
  AccountIdParamSchema,
  CreateAccountSessionBodySchema,
  CreatePaymentIntentBodySchema,
  CreateProductBodySchema,
  ListProductsQuerySchema,
} from "./schemas.js";

export const stripeRouter = Router();

// POST /api/v1/stripe/accounts -> create a connected account using controller only (no top-level type)
stripeRouter.post("/accounts", requireAuth, createAccountHandler);

// GET /api/v1/stripe/accounts/me -> ensure the current user has an account and return it
// IMPORTANT: declare before /accounts/:id so it doesn't get captured as id="me"
stripeRouter.get("/accounts/me", requireAuth, ensureMyAccountHandler);

// GET /api/v1/stripe/accounts/:id -> retrieve account status (no DB caching)
stripeRouter.get(
  "/accounts/:id",
  requireAuth,
  validate(AccountIdParamSchema, "params"),
  getAccountHandler
);

// Embedded-only: no Account Links hosted onboarding route

// POST /api/v1/stripe/accounts/:id/account-session -> create Account Session for embedded onboarding
stripeRouter.post(
  "/accounts/:id/account-session",
  requireAuth,
  validate(AccountIdParamSchema, "params"),
  validate(CreateAccountSessionBodySchema),
  createAccountSessionHandler
);

// GET /api/v1/stripe/pk -> publishable key for initializing Connect embedded components
stripeRouter.get("/pk", getPublishableKeyHandler);

// POST /api/v1/stripe/products -> create product on connected account using Stripe-Account header
stripeRouter.post(
  "/products",
  requireAuth,
  validate(CreateProductBodySchema),
  createProductHandler
);

// GET /api/v1/stripe/products?accountId=... -> list products on connected account
stripeRouter.get(
  "/products",
  validate(ListProductsQuerySchema, "query"),
  listProductsHandler
);

// POST /api/v1/stripe/payment-intents -> create PaymentIntent on connected account (Direct Charge) for embedded payments
stripeRouter.post(
  "/payment-intents",
  validate(CreatePaymentIntentBodySchema),
  createPaymentIntentHandler
);
