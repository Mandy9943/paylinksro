import { prisma } from "../../lib/prisma.js";
import type { CreatePayLinkInput, UpdatePayLinkInput } from "./schemas.js";

export async function listPayLinks(
  userId: string,
  limit = 50,
  cursor?: string
) {
  return prisma.payLink.findMany({
    where: { userId },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      priceType: true,
      amount: true,
      currency: true,
      active: true,
      serviceType: true,
      description: true,
      collectEmail: true,
      collectPhone: true,
      mainColor: true,
      createdAt: true,
      updatedAt: true,
      service: { select: { id: true, title: true, description: true } },
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          assets: true,
          coverImageUrl: true,
        },
      },
    },
  });
}

export async function createPayLink(userId: string, data: CreatePayLinkInput) {
  const toCreate = {
    userId,
    name: data.name,
    slug: data.slug,
    priceType: data.priceType,
    amount: data.priceType === "FIXED" ? data.amount ?? 0 : null,
    currency: data.currency ?? "RON",
    active: data.active ?? true,
    serviceType: data.serviceType,
    description: data.description,
    collectEmail: data.collectEmail ?? true,
    collectPhone: data.collectPhone ?? false,
    mainColor: data.mainColor,
  } as const;

  return prisma.payLink.create({
    data: {
      ...toCreate,
      ...(data.serviceType === "SERVICE" && data.service
        ? {
            service: {
              create: {
                title: data.service.title,
                description: data.service.description,
              },
            },
          }
        : {}),
      ...(data.serviceType === "DIGITAL_PRODUCT" && data.product
        ? {
            product: {
              create: {
                name: data.product.name,
                description: data.product.description,
                assets: data.product.assets as any,
                coverImageUrl: data.product.coverImageUrl,
              },
            },
          }
        : {}),
    },
    include: { service: true, product: true },
  });
}

export async function updatePayLink(
  userId: string,
  id: string,
  data: UpdatePayLinkInput
) {
  // Ensure ownership
  const existing = await prisma.payLink.findUnique({
    where: { id },
    include: { service: true, product: true },
  });
  if (!existing || existing.userId !== userId) {
    const e: any = new Error("Not found");
    e.status = 404;
    throw e;
  }

  const next: any = { ...data };
  if (data.priceType) {
    next.amount =
      data.priceType === "FIXED" ? data.amount ?? existing.amount ?? 0 : null;
  }
  if (typeof data.currency === "undefined") delete next.currency;
  return prisma.payLink.update({
    where: { id },
    data: {
      ...next,
      ...(data.service
        ? {
            service: existing.service
              ? {
                  update: {
                    title: data.service.title ?? undefined,
                    description: data.service.description,
                  },
                }
              : {
                  create: {
                    title: data.service.title!,
                    description: data.service.description,
                  },
                },
          }
        : {}),
      ...(data.product
        ? {
            product: existing.product
              ? {
                  update: {
                    name: data.product.name ?? undefined,
                    description: data.product.description,
                    assets: (data.product.assets as any) ?? undefined,
                    coverImageUrl: data.product.coverImageUrl ?? undefined,
                  },
                }
              : {
                  create: {
                    name: data.product.name!,
                    description: data.product.description,
                    assets: data.product.assets as any,
                    coverImageUrl: data.product.coverImageUrl,
                  },
                },
          }
        : {}),
    },
    include: { service: true, product: true },
  });
}

export async function deletePayLink(userId: string, id: string) {
  // Ensure ownership
  const existing = await prisma.payLink.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    const e: any = new Error("Not found");
    e.status = 404;
    throw e;
  }
  await prisma.payLink.delete({ where: { id } });
  return { ok: true };
}
