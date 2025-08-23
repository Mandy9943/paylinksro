# PayLinksro API

TypeScript Express API with Prisma, Zod validation, and magic link authentication.

## Features
- Express 5 with TypeScript
- Zod for schema validation
- Prisma ORM (PostgreSQL)
- Magic link auth (email one-time link -> issues JWT)
- Pino logging, Helmet, CORS, rate limiting

## Getting started
1. Copy env and set your values

```bash
cp .env.example .env
```

2. Install dependencies

```bash
npm install
```

3. Setup Prisma and DB

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Run dev server

```bash
npm run dev
```

API will be available at `http://localhost:4000/api`.

## Auth endpoints
- POST `/api/auth/request` body: `{ email, redirectTo? }`
- GET `/api/auth/verify?token=...&redirectTo?=...`

On verify, returns `{ token }` (JWT). You can set cookie logic if preferred.

## Stripe Connect (embedded)

This API includes sample endpoints to onboard connected accounts with embedded components (never leave your app), create products on connected accounts, list products, and create PaymentIntents for embedded payments.

Environment variables required:

- `STRIPE_SECRET_KEY` – Your Stripe secret key (sk_...) [Required]
- `STRIPE_PUBLISHABLE_KEY` – Your publishable key (pk_...) [Required for web UI]

Notes:

- API version pinned to 2025-07-30.basil.
- For demo, account status is always fetched live from Stripe (no DB cache).
- Direct Charges with an application fee using PaymentIntents and Stripe Elements (embedded payments). No hosted flows are used.

Key routes (all under `/api/v1/stripe`):

- `GET /pk` – Retrieve publishable key for client SDKs.
- `POST /accounts` – Create a connected account using controller properties only.
- `GET /accounts/:id` – Retrieve account info.
- `POST /accounts/:id/account-session` – Create an Account Session for Connect embedded components (onboarding/management).
- `POST /products` – Create a product on a connected account (requires `accountId`).
- `GET /products?accountId=...` – List products from a connected account.
- `POST /payment-intents` – Create a PaymentIntent on a connected account (Direct Charge + application fee) for embedded payments.

All endpoints return helpful errors if required values are missing.
