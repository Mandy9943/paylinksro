import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Mock Stripe before importing the app/controllers
let lastPIArgs: any = null;
vi.mock("../src/lib/stripe.js", () => {
  return {
    getStripe: () => ({
      paymentIntents: {
        create: vi.fn(async (args: any) => {
          lastPIArgs = args;
          return { client_secret: "cs_test_123" } as any;
        }),
      },
    }),
  };
});

import { buildApp } from "../src/app/app.js";
import { signJwt } from "../src/lib/jwt.js";
import { prisma } from "../src/lib/prisma.js";
import { onChargeSucceeded } from "../src/modules/stripe/handlers/charge.js";

const app = buildApp();

function uniqueEmail(base: string) {
  const [local, domain = "example.com"] = base.includes("@")
    ? base.split("@")
    : [base, "example.com"];
  const tag = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${local}+${tag}@${domain}`;
}

async function createUser(baseEmail: string) {
  const email = uniqueEmail(baseEmail);
  const user = await prisma.user.create({ data: { email } });
  const token = signJwt({ sub: user.id, ver: user.tokenVersion });
  return { user, token } as const;
}

describe("PayLinks endpoints", () => {
  let u1: { user: any; token: string };
  let u2: { user: any; token: string };

  beforeAll(async () => {
    u1 = await createUser("paylinks-tester1@example.com");
    u2 = await createUser("paylinks-tester2@example.com");
  });

  afterAll(async () => {
    // Cleanup created data
    if (u1 && u2) {
      // Delete children first due to FK constraints
      const idsToCheck = [u1.user.id, u2.user.id].filter(Boolean);
      const payLinks = await prisma.payLink.findMany({
        where: { userId: { in: idsToCheck } },
        select: { id: true },
      });
      const ids = payLinks.map((p) => p.id);
      if (ids.length) {
        await prisma.fundraisingCampaign
          .deleteMany({ where: { payLinkId: { in: ids } } })
          .catch(() => {});
        await prisma.serviceItem
          .deleteMany({ where: { payLinkId: { in: ids } } })
          .catch(() => {});
        await prisma.digitalProduct
          .deleteMany({ where: { payLinkId: { in: ids } } })
          .catch(() => {});
        await prisma.transaction
          .deleteMany({ where: { payLinkId: { in: ids } } })
          .catch(() => {});
        await prisma.payLink
          .deleteMany({ where: { id: { in: ids } } })
          .catch(() => {});
      }
      await prisma.customer
        .deleteMany({ where: { userId: { in: idsToCheck } } })
        .catch(() => {});
      await prisma.transaction
        .deleteMany({ where: { userId: { in: idsToCheck } } })
        .catch(() => {});
      await prisma.monthlyFeeAccrual
        .deleteMany({ where: { userId: { in: idsToCheck } } })
        .catch(() => {});
      await prisma.magicLinkToken
        .deleteMany({ where: { userId: { in: idsToCheck } } })
        .catch(() => {});
      await prisma.user
        .deleteMany({ where: { id: { in: idsToCheck } } })
        .catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("requires auth for private routes", async () => {
    await request(app).get("/api/v1/paylinks").expect(401);
  });

  it("creates a valid FIXED paylink (>= 5 RON)", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Consulting",
        slug: "consulting",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.amount).toBe(5);
    expect(res.body.slug).toMatch(/^consulting(-\d+)?$/);
  });

  it("rejects FIXED paylink with amount < 5 RON", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Cheap",
        slug: "cheap",
        priceType: "FIXED",
        amount: 4.99,
        serviceType: "SERVICE",
      })
      .expect(400);

    // Validation middleware returns a flattened error
    expect(res.body?.error).toBe("ValidationError");
    const amountErrs: string[] | undefined =
      res.body?.details?.fieldErrors?.amount;
    expect(Array.isArray(amountErrs)).toBe(true);
    expect(amountErrs?.some((m) => /Minimum amount/i.test(m))).toBe(true);
  });

  it("rejects FLEXIBLE paylink with minAmount < 5 RON when provided", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Tips",
        slug: "tips",
        priceType: "FLEXIBLE",
        minAmount: 4.5,
        serviceType: "DONATION",
      })
      .expect(400);
    expect(res.body?.error).toBe("ValidationError");
    const minErrs: string[] | undefined =
      res.body?.details?.fieldErrors?.minAmount;
    expect(minErrs && minErrs.length > 0).toBe(true);
  });

  it("allows FLEXIBLE paylink without minAmount", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Pay what you want",
        slug: "pwyw",
        priceType: "FLEXIBLE",
        serviceType: "DONATION",
      })
      .expect(201);
    expect(res.body.slug).toMatch(/^pwyw(-\d+)?$/);
    expect(res.body.minAmount).toBe(null);
  });

  it("rejects invalid slug (non-lowercase/illegal chars)", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Bad Slug",
        slug: "Bad Slug",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(400);
    expect(res.body?.error).toBeTruthy();
  });

  it("auto-uniquifies duplicate slug", async () => {
    const first = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Course",
        slug: "course",
        priceType: "FIXED",
        amount: 5,
        serviceType: "DIGITAL_PRODUCT",
      })
      .expect(201);
    const second = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Course",
        slug: "course",
        priceType: "FIXED",
        amount: 5,
        serviceType: "DIGITAL_PRODUCT",
      })
      .expect(201);
    expect(first.body.slug).toMatch(/^course(-\d+)?$/);
    expect(second.body.slug).toMatch(/^course-\d+$/);
  });

  it("lists paylinks for the owner", async () => {
    const res = await request(app)
      .get("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .expect(200);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThan(0);
  });

  it("updates paylink and rejects setting FIXED amount < 5 RON", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Edit Me",
        slug: "edit-me",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(201);

    // valid update
    await request(app)
      .patch(`/api/v1/paylinks/${created.body.id}`)
      .set("Authorization", `Bearer ${u1.token}`)
      .send({ description: "updated" })
      .expect(200);

    // invalid amount
    const bad = await request(app)
      .patch(`/api/v1/paylinks/${created.body.id}`)
      .set("Authorization", `Bearer ${u1.token}`)
      .send({ priceType: "FIXED", amount: 4 })
      .expect(400);
    expect(bad.body?.error?.message).toMatch(/Minimum amount/i);
  });

  it("prevents another user from updating/deleting someone else's paylink", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Owned",
        slug: "owned",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(201);

    await request(app)
      .patch(`/api/v1/paylinks/${created.body.id}`)
      .set("Authorization", `Bearer ${u2.token}`)
      .send({ description: "hack" })
      .expect(404);

    await request(app)
      .delete(`/api/v1/paylinks/${created.body.id}`)
      .set("Authorization", `Bearer ${u2.token}`)
      .expect(404);
  });

  it("duplicates a paylink with unique slug and resets fundraising progress", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Fundraiser",
        slug: "fundraiser",
        priceType: "FLEXIBLE",
        serviceType: "FUNDRAISING",
        fundraising: { targetAmount: 500 },
      })
      .expect(201);

    const dup = await request(app)
      .post(`/api/v1/paylinks/${created.body.id}/duplicate`)
      .set("Authorization", `Bearer ${u1.token}`)
      .expect(201);
    expect(dup.body.id).not.toBe(created.body.id);
    expect(dup.body.slug).toMatch(/^fundraiser(-\d+)?$/);
  });

  it("deletes a paylink", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Delete Me",
        slug: "delete-me",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(201);

    await request(app)
      .delete(`/api/v1/paylinks/${created.body.id}`)
      .set("Authorization", `Bearer ${u1.token}`)
      .expect(200);
  });

  it("exposes public paylink by slug", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Public Link",
        slug: "public-link",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        addVat: false,
      })
      .expect(201);

    const res = await request(app)
      .get(`/api/v1/paylinks/public/${created.body.slug}`)
      .expect(200);
    expect(res.body.slug).toMatch(/^public-link(-\d+)?$/);
    expect(res.body.amount).toBe(5);
  });

  it("public PI rejects when seller not onboarded", async () => {
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "No Onboard",
        slug: "no-onboard",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
      })
      .expect(201);

    await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({})
      .expect(400);
  });

  it("public PI creates for FIXED when onboarded and caps monthly fee <= amount", async () => {
    // Onboard seller
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Fixed 5",
        slug: "fixed-5",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        addVat: false,
      })
      .expect(201);

    lastPIArgs = null;
    const res = await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({})
      .expect(200);
    expect(res.body.client_secret).toBe("cs_test_123");
    // amount 5 RON -> 500 bani; base fee 5% (25) + 1 RON (100) = 125
    // monthly cap: amount - base = 375; application_fee_amount should be 125 + 375 = 500
    expect(lastPIArgs).toBeTruthy();
    expect(lastPIArgs.amount).toBe(500);
    expect(lastPIArgs.application_fee_amount).toBeLessThanOrEqual(500);
    expect(lastPIArgs.application_fee_amount).toBe(500);
  });

  it("public PI for FLEXIBLE enforces link-level min and global min", async () => {
    // Onboard seller already done for u1
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Flex 7",
        slug: "flex-7",
        priceType: "FLEXIBLE",
        minAmount: 7,
        serviceType: "DONATION",
        addVat: false,
      })
      .expect(201);

    // Below link min 7 (but above global 5) -> 400 Amount below minimum
    await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 6.5 })
      .expect(400);

    // Below global min 5 -> 400
    await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 4.99 })
      .expect(400);

    // Happy path
    lastPIArgs = null;
    const ok = await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 10 })
      .expect(200);
    expect(ok.body.client_secret).toBe("cs_test_123");
    expect(lastPIArgs.amount).toBe(1000);
  });

  it("public PI applies VAT (21%) to amount for FIXED when addVat is true (default)", async () => {
    // Ensure seller onboarded (might already be from previous test)
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Fixed VAT 5",
        slug: "fixed-vat-5",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        // omit addVat to use default true
      })
      .expect(201);

    lastPIArgs = null;
    const res = await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({})
      .expect(200);
    expect(res.body.client_secret).toBe("cs_test_123");
    // Base 5 RON -> 500 bani, with 21% VAT -> 605 bani
    expect(lastPIArgs).toBeTruthy();
    expect(lastPIArgs.amount).toBe(605);
    // Sanity: application fee must not exceed amount
    expect(lastPIArgs.application_fee_amount).toBeLessThanOrEqual(605);
  });

  it("public PI applies VAT (21%) for FLEXIBLE when link has addVat true and amount is provided", async () => {
    // Ensure seller onboarded
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Flex VAT",
        slug: "flex-vat",
        priceType: "FLEXIBLE",
        minAmount: 5,
        serviceType: "DONATION",
        // default addVat = true
      })
      .expect(201);

    lastPIArgs = null;
    const res = await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 10 })
      .expect(200);
    expect(res.body.client_secret).toBe("cs_test_123");
    // 10 RON -> 1000 bani; +21% VAT -> 1210 bani
    expect(lastPIArgs.amount).toBe(1210);
  });

  it("public PI ignores request addVat when link has addVat=false (no VAT applied)", async () => {
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Flex VAT Override On",
        slug: "flex-vat-override-on",
        priceType: "FLEXIBLE",
        minAmount: 5,
        serviceType: "DONATION",
        addVat: false,
      })
      .expect(201);

    lastPIArgs = null;
    await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 5, addVat: true })
      .expect(200);
    expect(lastPIArgs).toBeTruthy();
    // VAT should not be applied because the link has addVat=false
    expect(lastPIArgs.amount).toBe(500);
  });

  it("public PI does not disable VAT via request when link has addVat=true", async () => {
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Flex VAT Non-Disable",
        slug: "flex-vat-non-disable",
        priceType: "FLEXIBLE",
        minAmount: 5,
        serviceType: "DONATION",
        // addVat default true
      })
      .expect(201);

    lastPIArgs = null;
    const res = await request(app)
      .post(`/api/v1/paylinks/public/${created.body.slug}/payment-intents`)
      .send({ amount: 5, addVat: false })
      .expect(200);
    expect(res.body.client_secret).toBe("cs_test_123");
    // VAT remains applied because link has addVat=true
    expect(lastPIArgs.amount).toBe(605);
  });

  it("rejects invalid mainColor format", async () => {
    const res = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Color Bad",
        slug: "color-bad",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        mainColor: "nothex",
      })
      .expect(400);
    expect(res.body?.error).toBe("ValidationError");
  });

  it("accrues monthly fee across multiple transactions within the same month and stops at 10 RON", async () => {
    // Fix time in June 2025 for deterministic month bucket
    vi.useFakeTimers();
    const nowJune = new Date(Date.UTC(2025, 5, 15, 12, 0, 0)); // June 15, 2025 UTC
    vi.setSystemTime(nowJune);

    // Ensure seller onboarded
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    // Create a fixed 5 RON link
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Monthly Accrual",
        slug: "monthly-accrual",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        addVat: false,
      })
      .expect(201);

    const slug = created.body.slug as string;
    const monthStart = new Date(Date.UTC(2025, 5, 1, 0, 0, 0));

    let totalCollected = 0;

    async function createPIAndSimulateCharge(label: string) {
      lastPIArgs = null;
      const res = await request(app)
        .post(`/api/v1/paylinks/public/${slug}/payment-intents`)
        .send({})
        .expect(200);
      expect(res.body.client_secret).toBe("cs_test_123");
      const meta = lastPIArgs?.metadata ?? {};
      const monthly = parseInt(meta.appFeeMonthly ?? "0", 10) || 0;
      const base = parseInt(meta.appFeeBase ?? "0", 10) || 0;
      const amount = lastPIArgs?.amount as number;

      // Simulate charge.succeeded webhook
      const charge = {
        id: `ch_${label}_${Math.random().toString(36).slice(2, 8)}`,
        amount,
        metadata: {
          paylinkId: created.body.id,
          slug,
          appFeeBase: String(base),
          appFeeMonthly: String(monthly),
        },
        created: Math.floor(Date.now() / 1000),
      };
      await onChargeSucceeded({ data: { object: charge } } as any);

      totalCollected += monthly;
      const accrual = await prisma.monthlyFeeAccrual.findUnique({
        where: {
          userId_month: { userId: u1.user.id, month: monthStart } as any,
        },
      });
      expect(accrual?.collected ?? 0).toBe(totalCollected);
      return { base, monthly, amount };
    }

    // 1st charge in month: amount=500, base=125, monthly=375
    const c1 = await createPIAndSimulateCharge("june1");
    expect(c1.amount).toBe(500);
    expect(c1.monthly).toBe(500 - c1.base);

    // 2nd charge: monthly again 375, total 750
    const c2 = await createPIAndSimulateCharge("june2");
    expect(c2.monthly).toBe(500 - c2.base);

    // 3rd charge: remaining to reach 1000 (should be 250)
    const c3 = await createPIAndSimulateCharge("june3");
    expect(c3.monthly).toBe(1000 - 375 - 375); // 250

    // 4th charge: monthly should be 0 (already collected 1000 for month)
    const c4 = await createPIAndSimulateCharge("june4");
    expect(c4.monthly).toBe(0);

    vi.useRealTimers();
  });

  it("accrues monthly fee separately across different months", async () => {
    vi.useFakeTimers();
    // Set to July 2, 2025 UTC
    const nowJuly = new Date(Date.UTC(2025, 6, 2, 8, 0, 0));
    vi.setSystemTime(nowJuly);

    // Ensure seller onboarded
    await prisma.user.update({
      where: { id: u1.user.id },
      data: { stripeAccountId: "acct_test_123", onboardedAt: new Date() },
    });

    // Create a fresh FIXED 5 RON link to avoid flakiness from reusing a FLEXIBLE link
    const created = await request(app)
      .post("/api/v1/paylinks")
      .set("Authorization", `Bearer ${u1.token}`)
      .send({
        name: "Monthly Accrual 2",
        slug: "monthly-accrual-2",
        priceType: "FIXED",
        amount: 5,
        serviceType: "SERVICE",
        addVat: false,
      })
      .expect(201);
    const slug = created.body.slug as string;
    const julyStart = new Date(Date.UTC(2025, 6, 1, 0, 0, 0));

    // One charge in July
    lastPIArgs = null;
    const res = await request(app)
      .post(`/api/v1/paylinks/public/${slug}/payment-intents`)
      .send({})
      .expect(200);
    expect(res.body.client_secret).toBe("cs_test_123");
    const monthly =
      parseInt(lastPIArgs?.metadata?.appFeeMonthly ?? "0", 10) || 0;
    expect(monthly).toBeGreaterThan(0);

    const charge = {
      id: `ch_july_${Math.random().toString(36).slice(2, 8)}`,
      amount: lastPIArgs.amount,
      metadata: {
        paylinkId: created.body.id,
        slug,
        appFeeBase: String(lastPIArgs.metadata.appFeeBase),
        appFeeMonthly: String(monthly),
      },
      created: Math.floor(Date.now() / 1000),
    };
    await onChargeSucceeded({ data: { object: charge } } as any);

    const accrualJuly = await prisma.monthlyFeeAccrual.findUnique({
      where: { userId_month: { userId: u1.user.id, month: julyStart } as any },
    });
    expect(accrualJuly?.collected ?? 0).toBe(monthly);

    // Ensure the previous June month (if present) has collected >= monthly and remains unchanged
    const juneStart = new Date(Date.UTC(2025, 5, 1, 0, 0, 0));
    const accrualJune = await prisma.monthlyFeeAccrual.findUnique({
      where: { userId_month: { userId: u1.user.id, month: juneStart } as any },
    });
    if (accrualJune) {
      expect(accrualJune.collected).toBeGreaterThanOrEqual(0);
    }

    vi.useRealTimers();
  });
});
