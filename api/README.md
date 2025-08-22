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
