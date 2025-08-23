## Project overview

PayLinksro is a full-stack app for managing payment links (WIP):

- API: TypeScript + Express 5, Prisma (PostgreSQL), Zod validation, JWT auth via magic links, Pino logging.
- Web: Next.js App Router, React, axios, SWR, Tailwind v4, Radix UI/shadcn.

## Folder structure

- `api/`: Express API (TypeScript, ESM). Entry: `src/server.ts`, app: `src/app/app.ts`, routes: `src/app/routes.ts`.
  - `src/config/env.ts`: Zod-validated env parsing.
  - `src/middleware/`: `validate.ts` (Zod), `auth.ts` (JWT auth/admin), `error-handler.ts` (uniform JSON errors).
  - `src/lib/`: `prisma.ts`, `jwt.ts`, `logger.ts`, `crypto.ts`.
  - `src/modules/auth/`: magic-link request/verify flow (`service.ts`, `controller.ts`, `routes.ts`, `schemas.ts`).
  - `prisma/`: `schema.prisma`, migrations.
  - Base API path: `/api/v1` (health: `/health`).
- `web/`: Next.js app with components in `src/components`, hooks in `src/hooks`, API wrappers in `src/api` and `src/lib`.

## Libraries and frameworks

- API: Express 5, Prisma 5, Zod 3, jsonwebtoken 9, Pino 9, Helmet, CORS, express-rate-limit, Nodemailer/Resend.
- DB: PostgreSQL via `DATABASE_URL`.
- Web: Next.js 15, React 19, SWR, axios, Tailwind 4, Radix UI, shadcn/ui.

## Environment variables (API)

- Required: `DATABASE_URL`, `JWT_SECRET` (>=32 chars), `APP_ORIGIN` (e.g., https://app.local), `API_ORIGIN` (e.g., http://localhost:4000).
- Optional mail: `RESEND_API_KEY` or `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`/`SMTP_FROM`; default from: `MAIL_FROM`.
- Defaults: `PORT=4000`, `JWT_EXPIRES_IN=7d`.

## Coding standards and conventions

- TypeScript strict. Prefer named exports and small pure functions.
- API uses ESM with `type: module` and TS bundler resolution — include `.js` extension in intra-repo imports under `api/src`.
- Validation: Use Zod + `validate(schema, property?)`. Parsed data available at `req.validated.{body|query|params}`.
- Auth: Use `requireAuth` for protected routes and `requireAdmin` for admin-only. JWT Bearer required; revocation via `User.tokenVersion`.
- Errors: Throw or `next({ status, message, code? })`. Handler returns `{ error: { message, code? } }` with proper status. Validation errors return `{ error: "ValidationError", details }` (400).
- Logging: Use `logger` (Pino). Avoid secrets; sensitive headers are redacted.

## API patterns

- Mount new routes in `api/src/app/routes.ts` under `/api/v1/...`.
- Magic link flow:
  - POST `/api/v1/auth/request` body `{ email, redirectTo }` sends verification email. `redirectTo` must match `APP_ORIGIN` origin.
  - GET `/api/v1/auth/verify?token=...&redirectTo=...` issues JWT and, if `redirectTo` is valid, redirects with `#token=...` fragment. Fallback JSON: `{ token }`.
- Protected example: `GET /api/v1/me` returns `{ user: { id, email, role } }` when authorized.

## API module structure conventions

When creating new API modules, follow the existing folder/file structure exactly:

- Folder: `api/src/modules/<module>/`
- Files inside each module:
  - `routes.ts`: exports an Express `Router` and defines the HTTP endpoints.
  - `controller.ts`: request/response handlers only; no business logic.
  - `service.ts`: pure business logic and data access via Prisma Client.
  - `schemas.ts`: Zod schemas/types for request validation.

Notes:

- Use ESM import paths with `.js` extensions for intra-API imports (e.g., `../../middleware/validate.js`).
- Validate inputs in `routes.ts` with `validate(schema, property?)` before hitting controllers.
- Apply `requireAuth`/`requireAdmin` in routes as needed.
- Mount the module’s router in `api/src/app/routes.ts` under `/api/v1/<module>`.

Example structure (as used by `auth`):
`api/src/modules/auth/{routes.ts,controller.ts,service.ts,schemas.ts}`

## Frontend integration

- API base URL: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000/api`).
- Axios instance adds `Authorization: Bearer <token>` from `localStorage` and clears token on 401.
- On auth callback, call `captureTokenFromHash()` to persist token and remove it from URL.
- Auth state: `useAuth()` queries `/v1/me` when a token exists. Path alias `@/*` → `web/src/*`.

## Build and scripts

- API (Node >= 18.17): dev `npm run dev`, build `npm run build`, start `npm start`; Prisma: `prisma:generate`, `prisma:migrate`, `prisma:studio`; tests `npm test`.
- Web: dev `npm run dev`, build `npm run build`, start `npm start`.

## Data model (summary)

- `User { id, email(unique), role(USER|ADMIN), tokenVersion, disabledAt, timestamps }`
- `MagicLinkToken { tokenHash(unique), userId -> User, email, expiresAt, usedAt, purpose }`
- `Session { id, userId, createdAt }` (present, not actively used).

## Security notes

- Enforce same-origin on `redirectTo` against `APP_ORIGIN` to prevent open redirects.
- JWT payload: `{ sub: userId, ver: tokenVersion }`, HS256, expiration `JWT_EXPIRES_IN`.
- Chain `requireAuth` then `requireAdmin` for admin endpoints.

## Database changes (Prisma-first workflow)

All database changes must go through Prisma. Avoid ad‑hoc SQL and apply migrations via Prisma only.

Standard steps for a schema change:

1. Edit `api/prisma/schema.prisma` to update the data model.
2. Generate types/Client: from `api/` run `npm run prisma:generate`.
3. Create and apply a dev migration: from `api/` run `npm run prisma:migrate -- --name <change_name>`.

Guidelines:

- Always use the shared Prisma Client from `api/src/lib/prisma.ts` in services.
- Prefer typed Prisma Client operations; if raw SQL is unavoidable, use `prisma.$queryRaw`/`$executeRaw` and keep it minimal.
- Open Prisma Studio with `npm run prisma:studio` to inspect data during development.
