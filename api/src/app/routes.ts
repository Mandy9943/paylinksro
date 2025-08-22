import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { authRouter } from "../modules/auth/routes.js";

export const router = Router();

router.use("/auth", authRouter);

router.get("/me", requireAuth, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, role: true },
  });
  res.json({ user });
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
