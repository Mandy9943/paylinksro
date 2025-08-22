import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/lib/prisma.js";

const app = buildApp();

describe("Auth (Magic Link)", () => {
  beforeAll(async () => {
    // ensure clean DB state for email used in tests
    await prisma.magicLinkToken
      .deleteMany({ where: { email: "tester@example.com" } })
      .catch(() => {});
    await prisma.user
      .deleteMany({ where: { email: "tester@example.com" } })
      .catch(() => {});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("POST /api/v1/auth/request should accept email and respond ok", async () => {
    // Missing redirectTo should 400 now
    await request(app)
      .post("/api/v1/auth/request")
      .send({ email: "tester@example.com" })
      .expect(400);

    // Providing redirectTo (same-origin) should 200
    const res = await request(app)
      .post("/api/v1/auth/request")
      .send({
        email: "tester@example.com",
        redirectTo: `${env.APP_ORIGIN}/dashboard`,
      })
      .expect(200);

    expect(res.body).toHaveProperty("ok", true);
    // In dev, debug may be present
    if (res.body.debug) {
      expect(res.body.debug).toHaveProperty("token");
      expect(res.body.debug).toHaveProperty("url");
    }
  });

  it("GET /api/v1/auth/verify should return a JWT when provided a valid token", async () => {
    // Get a debug token by requesting magic link
    const reqRes = await request(app)
      .post("/api/v1/auth/request")
      .send({
        email: "tester@example.com",
        redirectTo: `${env.APP_ORIGIN}/dashboard`,
      })
      .expect(200);

    const token = reqRes.body?.debug?.token;
    if (!token) {
      // If not in dev or debug disabled, we cannot continue this e2e in-memory
      return;
    }

    const verifyRes = await request(app)
      .get("/api/v1/auth/verify")
      .query({ token })
      .expect(200);

    expect(verifyRes.body).toHaveProperty("token");
    expect(typeof verifyRes.body.token).toBe("string");
  });

  it("GET /api/v1/auth/verify supports redirectTo to frontend and adds token in fragment", async () => {
    const email = "redirtester@example.com";
    await prisma.magicLinkToken
      .deleteMany({ where: { email } })
      .catch(() => {});
    await prisma.user.deleteMany({ where: { email } }).catch(() => {});

    const reqRes = await request(app)
      .post("/api/v1/auth/request")
      .send({ email, redirectTo: `${env.APP_ORIGIN}/dashboard` })
      .expect(200);
    const token = reqRes.body?.debug?.token;
    expect(token).toBeTruthy();

    const verifyRes = await request(app)
      .get("/api/v1/auth/verify")
      .query({ token, redirectTo: `${env.APP_ORIGIN}/dashboard` })
      .redirects(0);

    expect(verifyRes.status).toBe(302);
    const location = verifyRes.headers["location"] as string;
    expect(location.startsWith(`${env.APP_ORIGIN}/dashboard`)).toBe(true);
    expect(location.includes("#token=")).toBe(true);
  });
});
