import { prisma } from "../../lib/prisma.js";

export async function getMyAffiliateSummary(userId: string) {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { affiliateCode: true },
  });
  const [pending, available, allocated, paid, referralsCount] =
    await Promise.all([
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { affiliateUserId: userId, status: "PENDING" },
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { affiliateUserId: userId, status: "AVAILABLE" },
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { affiliateUserId: userId, status: "ALLOCATED" },
      }),
      prisma.commission.aggregate({
        _sum: { amount: true },
        where: { affiliateUserId: userId, status: "PAID" },
      }),
      prisma.referral.count({ where: { affiliateUserId: userId } }),
    ]);

  const recentCommissions = await prisma.commission.findMany({
    where: { affiliateUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      referred: { select: { id: true, email: true } },
    },
  });

  const recentReferrals = await prisma.referral.findMany({
    where: { affiliateUserId: userId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      createdAt: true,
      referred: { select: { id: true, email: true } },
    },
  });

  return {
    code: me?.affiliateCode ?? null,
    totals: {
      pending: pending._sum.amount ?? 0,
      available: available._sum.amount ?? 0,
      allocated: allocated._sum.amount ?? 0,
      paid: paid._sum.amount ?? 0,
      lifetimeEarned:
        (paid._sum.amount ?? 0) +
        (allocated._sum.amount ?? 0) +
        (available._sum.amount ?? 0) +
        (pending._sum.amount ?? 0),
      referrals: referralsCount,
    },
    recent: { commissions: recentCommissions, referrals: recentReferrals },
  };
}

export async function listMyCommissions(
  userId: string,
  status?: string,
  cursor?: string,
  limit = 20
) {
  return prisma.commission.findMany({
    where: { affiliateUserId: userId, status: status as any },
    orderBy: { createdAt: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    take: limit,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      transactionId: true,
      referred: { select: { id: true, email: true } },
    },
  });
}

export async function listMyReferrals(
  userId: string,
  cursor?: string,
  limit = 20
) {
  return prisma.referral.findMany({
    where: { affiliateUserId: userId },
    orderBy: { createdAt: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    take: limit,
    select: {
      id: true,
      createdAt: true,
      referred: { select: { id: true, email: true } },
    },
  });
}

export async function requestPayoutAllAvailable(
  userId: string,
  bankDetails?: string
) {
  // Sum available
  const availableAgg = await prisma.commission.aggregate({
    _sum: { amount: true },
    where: { affiliateUserId: userId, status: "AVAILABLE" },
  });
  const available = availableAgg._sum.amount ?? 0;
  if (available < 5000) {
    throw Object.assign(new Error("Minimum withdrawal 50 RON"), {
      status: 400,
    });
  }
  // FIFO allocate by holdReleaseAt then createdAt
  const items = await prisma.commission.findMany({
    where: { affiliateUserId: userId, status: "AVAILABLE" },
    orderBy: [{ holdReleaseAt: "asc" }, { createdAt: "asc" }],
    select: { id: true, amount: true },
  });
  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.create({
      data: {
        affiliateUserId: userId,
        amount: available,
        status: "REQUESTED",
        bankDetails: bankDetails || undefined,
      },
      select: { id: true },
    });
    for (const c of items) {
      await tx.payoutItem.create({
        data: { payoutId: payout.id, commissionId: c.id, amount: c.amount },
      });
      await tx.commission.update({
        where: { id: c.id },
        data: { status: "ALLOCATED" },
      });
    }
    return payout;
  });
}

// Admin
export async function adminListPayouts(
  status?: string,
  affiliateUserId?: string,
  cursor?: string,
  limit = 50
) {
  return prisma.payout.findMany({
    where: {
      status: status as any,
      affiliateUserId: affiliateUserId || undefined,
    },
    orderBy: { requestedAt: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    take: limit,
    select: {
      id: true,
      amount: true,
      status: true,
      requestedAt: true,
      sentAt: true,
      affiliateUserId: true,
      bankDetails: true,
      proofUrl: true,
    },
  });
}

export async function adminSetPayoutStatus(
  id: string,
  status: "SENT" | "FAILED",
  proofUrl?: string
) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!payout) throw Object.assign(new Error("Not found"), { status: 404 });
    if (status === "SENT") {
      await tx.payout.update({
        where: { id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          proofUrl: proofUrl || undefined,
        },
      });
      // commissions -> PAID
      const items = await tx.payoutItem.findMany({
        where: { payoutId: id },
        select: { commissionId: true },
      });
      for (const it of items) {
        await tx.commission.update({
          where: { id: it.commissionId },
          data: { status: "PAID" },
        });
      }
    } else if (status === "FAILED") {
      await tx.payout.update({
        where: { id },
        data: { status: "FAILED", failedAt: new Date() },
      });
      // revert commissions to AVAILABLE
      const items = await tx.payoutItem.findMany({
        where: { payoutId: id },
        select: { commissionId: true },
      });
      for (const it of items) {
        await tx.commission.update({
          where: { id: it.commissionId },
          data: { status: "AVAILABLE" },
        });
      }
    }
    return { ok: true };
  });
}

export async function releasePendingHoldsJob() {
  const now = new Date();
  const result = await prisma.commission.updateMany({
    where: { status: "PENDING", holdReleaseAt: { lte: now } },
    data: { status: "AVAILABLE" },
  });
  return { updated: result.count };
}
