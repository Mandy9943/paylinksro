import { prisma } from "../../lib/prisma.js";

const statusMap: Record<string, any> = {
  succeeded: "SUCCEEDED",
  failed: "FAILED",
  refunded: "REFUNDED",
  disputed: "DISPUTED",
  uncaptured: "UNCAPTURED",
  requires_action: "REQUIRES_ACTION",
};

export async function listTransactionsService(args: {
  userId: string;
  status?: string;
  limit?: number;
  cursor?: string;
}) {
  const { userId, status, limit = 50, cursor } = args;

  const whereBase = { userId } as any;
  const where = { ...whereBase } as any;
  if (status && status !== "all") {
    const mapped = statusMap[status];
    if (mapped) where.status = mapped;
  }

  const items = await prisma.transaction.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      paymentMethodType: true,
      cardBrand: true,
      cardLast4: true,
      stripePaymentIntentId: true,
      stripeChargeId: true,
      receiptUrl: true,
      description: true,
      createdAt: true,
      customer: { select: { email: true } },
    },
  });

  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id : undefined;

  const [succeeded, failed, refunded, disputed, uncaptured] = await Promise.all(
    [
      prisma.transaction.count({
        where: { ...whereBase, status: "SUCCEEDED" },
      }),
      prisma.transaction.count({ where: { ...whereBase, status: "FAILED" } }),
      prisma.transaction.count({ where: { ...whereBase, status: "REFUNDED" } }),
      prisma.transaction.count({ where: { ...whereBase, status: "DISPUTED" } }),
      prisma.transaction.count({
        where: { ...whereBase, status: "UNCAPTURED" },
      }),
    ]
  );
  const all = await prisma.transaction.count({ where: whereBase });

  return {
    items: data,
    counts: {
      all,
      succeeded,
      refunded,
      disputed,
      failed,
      uncaptured,
    },
    nextCursor,
  };
}
