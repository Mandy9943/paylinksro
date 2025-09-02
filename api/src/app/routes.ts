import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { analyticsRouter } from "../modules/analytics/routes.js";
import { authRouter } from "../modules/auth/routes.js";
import { customersRouter } from "../modules/customers/routes.js";
import { payLinksRouter } from "../modules/paylinks/routes.js";
import purchasesRouter from "../modules/purchases/routes.js";
import { settingsRouter } from "../modules/settings/routes.js";
import { stripeRouter } from "../modules/stripe/routes.js";
import { transactionsRouter } from "../modules/transactions/routes.js";
import { uploadsRouter } from "../modules/uploads/routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/stripe", stripeRouter);
router.use("/paylinks", payLinksRouter);
router.use("/uploads", uploadsRouter);
router.use("/transactions", transactionsRouter);
router.use("/customers", customersRouter);
router.use("/analytics", analyticsRouter);
router.use("/settings", settingsRouter);
router.use("/purchases", purchasesRouter);

// Webhook lives outside of /api/v1 to avoid auth/validation middlewares; we expose it at root in app.ts
// Export a lightweight sub-router to mount it from app.ts would be cleaner, but we can handle here too by exporting the handler.

router.get("/me", requireAuth, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true, onboardedAt: true },
  });
  res.json({ user, onboarded: !!user?.onboardedAt });
});

router.post(
  "/admin/users/:id/revoke",
  requireAuth,
  requireAdmin,
  async (req: any, res) => {
    const { id } = req.params;
    const updated = await prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
    });
    res.json({ ok: true, tokenVersion: updated.tokenVersion });
  }
);

router.post(
  "/admin/users/:id/disable",
  requireAuth,
  requireAdmin,
  async (req: any, res) => {
    const { id } = req.params;
    await prisma.user.update({
      where: { id },
      data: { disabledAt: new Date() },
    });
    res.json({ ok: true });
  }
);

router.post(
  "/admin/users/:id/enable",
  requireAuth,
  requireAdmin,
  async (req: any, res) => {
    const { id } = req.params;
    await prisma.user.update({ where: { id }, data: { disabledAt: null } });
    res.json({ ok: true });
  }
);
