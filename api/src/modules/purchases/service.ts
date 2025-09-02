import { prisma } from "../../lib/prisma.js";
import { presignGetUrl } from "../../lib/r2.js";

export type PurchaseItem = {
  id: string; // transaction id
  payLinkId: string;
  payLinkName: string;
  sellerId: string;
  succeededAt: Date | null;
  productName: string | null;
  productCoverImageUrl: string | null;
  serviceType?: "DIGITAL_PRODUCT" | "SERVICE";
  assets: { key: string; name?: string | null }[];
};

export async function listPurchasesForEmail(
  email: string
): Promise<PurchaseItem[]> {
  // Find all successful transactions for digital products where receipt/billing email matched this email.
  // We don't persist email on Transaction; rely on Stripe charge details stored? Not stored currently.
  // Alternative: derive from Customer records where email matches.
  const customers = await prisma.customer.findMany({
    where: { email: email.toLowerCase() },
    select: { id: true, userId: true },
  });
  if (!customers.length) return [];
  const customerIds = customers.map((c) => c.id);

  const tx = await prisma.transaction.findMany({
    where: {
      customerId: { in: customerIds },
      status: "SUCCEEDED",
      payLink: { serviceType: { in: ["DIGITAL_PRODUCT", "SERVICE"] as any } },
    },
    orderBy: { succeededAt: "desc" },
    select: {
      id: true,
      payLinkId: true,
      succeededAt: true,
      userId: true,
      payLink: {
        select: {
          name: true,
          serviceType: true,
          product: { select: { name: true, assets: true, coverImageUrl: true } },
          service: { select: { title: true, coverImageUrl: true } },
        },
      },
    },
  });

  return tx.map((t) => {
    const isDigital = (t.payLink as any).serviceType === "DIGITAL_PRODUCT";
    const raw = isDigital ? ((t.payLink.product?.assets as any) || []) : [];
    const assets: { key: string; name?: string | null }[] = [];
    if (Array.isArray(raw)) {
      for (const it of raw) {
        if (typeof it === "string") assets.push({ key: it });
        else if (it && typeof it === "object") {
          if (typeof (it as any).key === "string")
            assets.push({ key: (it as any).key, name: (it as any).name });
          else if (typeof (it as any).r2Key === "string")
            assets.push({ key: (it as any).r2Key, name: (it as any).name });
        }
      }
    }
    return {
      id: t.id,
      payLinkId: t.payLinkId,
      payLinkName: t.payLink.name,
      sellerId: t.userId,
      succeededAt: t.succeededAt,
      productName:
        t.payLink.product?.name ?? t.payLink.service?.title ?? t.payLink.name,
      productCoverImageUrl:
        (t.payLink.product as any)?.coverImageUrl ||
        (t.payLink.service as any)?.coverImageUrl ||
        null,
      serviceType: (t.payLink as any).serviceType,
      assets,
    };
  });
}

export async function presignDownloadForBuyer(
  userEmail: string,
  body: { payLinkId: string; key: string }
): Promise<{ url: string } | null> {
  // Check the requesting user owns a successful transaction for the given payLink and asset via Customer.email.
  const customers = await prisma.customer.findMany({
    where: { email: userEmail.toLowerCase() },
    select: { id: true },
  });
  if (!customers.length) return null;
  const tx = await prisma.transaction.findFirst({
    where: {
      payLinkId: body.payLinkId,
      customerId: { in: customers.map((c) => c.id) },
      status: "SUCCEEDED",
  payLink: { serviceType: "DIGITAL_PRODUCT" },
    },
    select: { payLink: { select: { product: { select: { assets: true } } } } },
  });
  if (!tx) return null;
  const assets = (tx.payLink.product?.assets as any) || [];
  const keys = new Set<string>();
  if (Array.isArray(assets)) {
    for (const it of assets) {
      if (typeof it === "string") keys.add(it);
      else if (it && typeof it === "object") {
        if (typeof (it as any).key === "string") keys.add((it as any).key);
        else if (typeof (it as any).r2Key === "string")
          keys.add((it as any).r2Key);
      }
    }
  }
  if (!keys.has(body.key)) return null;
  const url = await presignGetUrl({
    key: body.key,
    expiresInSeconds: 60 * 60 * 6,
  });
  return { url };
}
