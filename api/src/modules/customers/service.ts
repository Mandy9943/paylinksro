import { prisma } from "../../lib/prisma.js";

export async function listCustomersService(args: {
  userId: string;
  segment?: string;
  limit?: number;
  cursor?: string;
}) {
  const { userId, segment = "all", limit = 50, cursor } = args;

  // Base where for customers owned by user
  const where = { userId } as any;

  // Pull customers with basic info
  const items = await prisma.customer.findMany({
    where,
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      updatedAt: true,
    },
  });
  const hasMore = items.length > limit;
  const base = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore ? base[base.length - 1]?.id : undefined;

  // For aggregates, fetch per customer stats
  const customerIds = base.map((c) => c.id);
  const agg = await prisma.transaction.groupBy({
    by: ["customerId"],
    where: {
      userId,
      customerId: { in: customerIds.filter(Boolean) as string[] },
    },
    _sum: { amount: true },
    _count: { _all: true },
    orderBy: { _sum: { amount: "desc" } },
  });
  const aggMap = new Map(
    agg.map((a) => [
      a.customerId,
      { totalAmount: a._sum.amount || 0, count: a._count._all },
    ])
  );

  // Compute segment-specific filtering client-side for first pass
  let enriched = base.map((c) => ({
    ...c,
    totalAmount: aggMap.get(c.id)?.totalAmount || 0,
    payments: aggMap.get(c.id)?.count || 0,
  }));

  if (segment === "top") {
    enriched = enriched.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (segment === "repeat") {
    enriched = enriched.filter((c) => c.payments > 1);
  } else if (segment === "first-time") {
    enriched = enriched.filter((c) => c.payments === 1);
  } else if (segment === "recent") {
    enriched = enriched.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }
  // high-refunds / high-disputes require more metrics; left for later

  const total = await prisma.customer.count({ where: { userId } });

  return {
    items: enriched,
    counts: {
      all: total,
      top: undefined,
      "first-time": undefined,
      repeat: undefined,
      recent: undefined,
      "high-refunds": undefined,
      "high-disputes": undefined,
    },
    nextCursor,
  };
}
