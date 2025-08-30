import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/lib/prisma.js";

const app = buildApp();

const ADMIN_EMAIL = "admin@example.com";
const USER_EMAIL = "bob@example.com";

async function loginViaMagic(email: string) {
  const reqRes = await request(app)
    .post("/api/v1/auth/request")
    .send({ email, redirectTo: `${env.APP_ORIGIN}/dashboard` })
    .expect(200);
  const token = reqRes.body?.debug?.token;
  expect(token).toBeTruthy();
  const verifyRes = await request(app)
    .get("/api/v1/auth/verify")
    .query({ token })
    .expect(200);
  return verifyRes.body.token as string;
}

describe("Admin: revoke and disable user", () => {
  let adminToken: string;
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean state
    await prisma.magicLinkToken.deleteMany({
      where: { email: { in: [ADMIN_EMAIL, USER_EMAIL] } },
    });

    await prisma.user.deleteMany({
      where: { email: { in: [ADMIN_EMAIL, USER_EMAIL] } },
    });

    // Create admin and user via magic link
    adminToken = await loginViaMagic(ADMIN_EMAIL);
    userToken = await loginViaMagic(USER_EMAIL);

    // Promote admin
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { role: "ADMIN" },
    });

    // Capture user id
    const u = await prisma.user.findUnique({ where: { email: USER_EMAIL } });
    userId = u!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("protected /me returns current user for valid token", async () => {
    const me = await request(app)
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    expect(me.body.user.email).toBe(USER_EMAIL);
  });

  it("admin revoke invalidates existing tokens", async () => {
    // Revoke user
    await request(app)
      .post(`/api/v1/admin/users/${userId}/revoke`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Old token should now fail
    await request(app)
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(401);

    // New login should succeed
    userToken = await loginViaMagic(USER_EMAIL);
    const me2 = await request(app)
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
    expect(me2.body.user.email).toBe(USER_EMAIL);
  });

  it("disabling a user blocks access even with a fresh token", async () => {
    // Disable
    await request(app)
      .post(`/api/v1/admin/users/${userId}/disable`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Fresh login
    userToken = await loginViaMagic(USER_EMAIL);

    // Should be blocked
    await request(app)
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    // Re-enable
    await request(app)
      .post(`/api/v1/admin/users/${userId}/enable`)
      .set("Authorization", `Bearer ${adminToken}`)
      .expect(200);

    // Fresh login works again
    userToken = await loginViaMagic(USER_EMAIL);
    await request(app)
      .get("/api/v1/me")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200);
  });
});
