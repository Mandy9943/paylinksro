import type Stripe from "stripe";
import { prisma } from "../../lib/prisma.js";
import { getStripe } from "../../lib/stripe.js";

function rangeOrDefault(from?: Date, to?: Date) {
  const end = to ?? new Date();
  const start = from ?? new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function getSummary(userId: string, from?: Date, to?: Date) {
  const { start, end } = rangeOrDefault(from, to);

  const [success, refunds, disputes, customers, netOfPlatform] = await Promise.all([
    prisma.transaction.aggregate({
      _sum: { amount: true, netAmount: true, refundedAmount: true },
      _count: { _all: true },
      where: {
        userId,
        status: "SUCCEEDED",
        succeededAt: { gte: start, lte: end },
      },
    }),
    prisma.transaction.aggregate({
      _sum: { refundedAmount: true },
      where: { userId, refundedAt: { gte: start, lte: end } },
    }),
    prisma.transaction.count({
      where: {
        userId,
        status: "DISPUTED",
        disputedAt: { gte: start, lte: end },
      },
    }),
    prisma.customer.count({
      where: { userId, createdAt: { gte: start, lte: end } },
    }),
    // Sum of amount minus platform fees (percent + fixed + monthly portions)
    prisma.$queryRawUnsafe<{ sum: bigint | null }[]>(
      `select sum(("amount" - coalesce("appFeePercent",0) - coalesce("appFeeFixed",0) - coalesce("appFeeMonthly",0))) as sum
       from "Transaction"
       where "userId" = $1
         and "status" = 'SUCCEEDED'
         and "succeededAt" between $2 and $3`,
      userId,
      start,
      end
    ),
  ]);

  const successCount = success._count._all ?? 0;
  const gross = success._sum.amount ?? 0;
  // Net of platform fee (does not account for Stripe processing fees)
  const net = (() => {
    const row = Array.isArray(netOfPlatform) ? netOfPlatform[0] : undefined;
    if (!row) return null;
    const val = row.sum == null ? null : Number(row.sum);
    return val;
  })();
  const refunded = refunds._sum.refundedAmount ?? 0;

  // Average processing time: use succeededAt - createdAt on succeeded transactions
  const times = await prisma.transaction.findMany({
    where: {
      userId,
      status: "SUCCEEDED",
      succeededAt: { gte: start, lte: end },
    },
    select: { createdAt: true, succeededAt: true },
    take: 5000,
  });
  let avgProcessingMs: number | null = null;
  if (times.length) {
    const total = times.reduce((acc, t) => {
      if (!t.succeededAt) return acc;
      const delta = t.succeededAt.getTime() - t.createdAt.getTime();

      // Clamp to zero to avoid negatives from backfilled rows where createdAt > succeededAt
      return acc + Math.max(0, delta);
    }, 0);

    avgProcessingMs = Math.round(
      total / Math.max(1, times.filter((t) => !!t.succeededAt).length)
    );
  }

  return {
    revenueGrossMinor: gross,
    revenueNetMinor: net,
    refundedMinor: refunded,
    successCount,
    disputesCount: disputes,
    newCustomers: customers,
    avgProcessingMs,
  };
}

export async function getPaymentMethods(
  userId: string,
  from?: Date,
  to?: Date
) {
  const { start, end } = rangeOrDefault(from, to);
  const rows = await prisma.transaction.groupBy({
    by: ["cardBrand"],
    _count: { _all: true },
    where: {
      userId,
      status: "SUCCEEDED",
      succeededAt: { gte: start, lte: end },
    },
  });
  const total = rows.reduce((a, r) => a + (r._count._all || 0), 0) || 1;
  return rows.map((r) => ({
    brand: r.cardBrand || "unknown",
    count: r._count._all || 0,
    pct: Math.round(((r._count._all || 0) / total) * 100),
  }));
}

export async function getRevenueSeries(
  userId: string,
  interval: "day" | "month",
  from?: Date,
  to?: Date
) {
  const { start, end } = rangeOrDefault(from, to);
  const unit = interval === "month" ? "month" : "day";
  const buckets = await prisma.$queryRawUnsafe<{ bucket: Date; sum: bigint }[]>(
    `select date_trunc('${unit}', coalesce("succeededAt", "createdAt")) as bucket,
            sum(("amount" - coalesce("appFeePercent",0) - coalesce("appFeeFixed",0) - coalesce("appFeeMonthly",0))) as sum
     from "Transaction"
     where "userId" = $1
       and ("succeededAt" between $2 and $3)
       and "status" = 'SUCCEEDED'
     group by 1
     order by 1 asc`,
    userId,
    start,
    end
  );
  return buckets.map((b) => ({ bucket: b.bucket, amountMinor: Number(b.sum) }));
}

export async function reconcileUserWindow(
  userId: string,
  from?: Date,
  to?: Date
) {
  const { start, end } = rangeOrDefault(from, to);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { stripeAccountId: true },
  });
  const accountId = user?.stripeAccountId;
  if (!accountId) return { updated: 0 };
  const stripe = getStripe();

  const gte = Math.floor(start.getTime() / 1000);
  const lte = Math.floor(end.getTime() / 1000);
  let startingAfter: string | undefined = undefined;
  let updated = 0;

  for (let page = 0; page < 10; page++) {
    const charges: Stripe.ApiList<Stripe.Charge> = await stripe.charges.list({
      limit: 100,
      starting_after: startingAfter,
      created: { gte, lte },
      expand: ["data.payment_intent"],
    });
    if (!charges.data.length) break;
    for (const charge of charges.data) {
      const pi: any = (charge as any).payment_intent;
      const onBehalf = pi?.on_behalf_of as string | undefined;
      if (onBehalf !== accountId) continue;
      const metadata = (charge.metadata as any) || (pi?.metadata as any) || {};
      const paylinkId = (metadata.paylinkId as string | undefined) || undefined;
      if (!paylinkId) continue;
      const link = await prisma.payLink.findUnique({
        where: { id: paylinkId },
        select: { id: true, userId: true, currency: true },
      });
      if (!link) continue;
      const pm: any = (charge.payment_method_details as any) || {};
      const card: any = pm?.card || {};
      const amountMinor = charge.amount || 0;
      const succeededAt = charge.created
        ? new Date(charge.created * 1000)
        : new Date();
      const netMinor = (charge as any)?.transfer?.amount as number | undefined;

      await prisma.transaction.upsert({
        where: { stripeChargeId: charge.id },
        update: {
          status: "SUCCEEDED",
          receiptUrl: charge.receipt_url || null,
          description: charge.description || null,
          refundedAmount: (charge.amount_refunded as number | undefined) || 0,
          succeededAt,
          netAmount: typeof netMinor === "number" ? netMinor : undefined,
          paymentMethodType: pm?.type || null,
          cardBrand: card?.brand || null,
          cardLast4: card?.last4 || null,
        },
        create: {
          userId: link.userId,
          payLinkId: link.id,
          amount: amountMinor,
          currency: (link.currency || "RON").toUpperCase(),
          status: "SUCCEEDED",
          stripePaymentIntentId: (charge.payment_intent as any)?.id || null,
          stripeChargeId: charge.id,
          paymentMethodType: pm?.type || null,
          cardBrand: card?.brand || null,
          cardLast4: card?.last4 || null,
          description: charge.description || null,
          receiptUrl: charge.receipt_url || null,
          succeededAt,
          netAmount: typeof netMinor === "number" ? netMinor : undefined,
          // Use PI.created as the best approximation of when the payment started
          createdAt: pi?.created
            ? new Date((pi.created as number) * 1000)
            : succeededAt,
        },
      });
      updated++;
      // Handle refunds marking
      if ((charge.amount_refunded || 0) > 0) {
        await prisma.transaction.updateMany({
          where: { stripeChargeId: charge.id },
          data: {
            status: "REFUNDED",
            refundedAmount: charge.amount_refunded || undefined,
            refundedAt: new Date(),
          },
        });
      }
    }
    if (!charges.has_more) break;
    startingAfter = charges.data[charges.data.length - 1]?.id;
  }
  return { updated };
}
