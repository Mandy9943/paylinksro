import { prisma } from "../../lib/prisma.js";
import type { CreatePayLinkInput, UpdatePayLinkInput } from "./schemas.js";

// Generate a human-friendly unique slug by appending a numeric suffix when needed
async function ensureUniqueSlug(baseSlug: string) {
  // Treat trailing -<number> as a suffix and use the root for uniqueness
  const root = baseSlug.replace(/-\d+$/, "");
  const existing = await prisma.payLink.findMany({
    where: { slug: { startsWith: root } },
    select: { slug: true },
  });
  const taken = new Set(existing.map((e) => e.slug));
  if (!taken.has(root)) return root;
  let n = 2;
  while (taken.has(`${root}-${n}`)) n++;
  return `${root}-${n}`;
}

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
      minAmount: true,
      currency: true,
      active: true,
      serviceType: true,
      description: true,
      collectEmail: true,
      collectPhone: true,
      collectBillingAddress: true,
      mainColor: true,
      createdAt: true,
      updatedAt: true,
      service: {
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          assets: true,
          coverImageUrl: true,
        },
      },
      fundraising: {
        select: {
          id: true,
          targetAmount: true,
          currentRaised: true,
          coverImageUrl: true,
        },
      },
    },
  });
}

export async function createPayLink(userId: string, data: CreatePayLinkInput) {
  // Ensure slug uniqueness (global) while keeping it readable
  const uniqueSlug = await ensureUniqueSlug(data.slug);
  const toCreate = {
    userId,
    name: data.name,
    slug: uniqueSlug,
    priceType: data.priceType,
    amount: data.priceType === "FIXED" ? data.amount ?? 0 : null,
    minAmount:
      data.priceType === "FLEXIBLE" ? (data as any).minAmount ?? null : null,
    currency: data.currency ?? "RON",
    active: data.active ?? true,
    serviceType: data.serviceType,
    description: data.description,
    collectEmail: data.collectEmail ?? true,
    collectPhone: data.collectPhone ?? false,
    collectBillingAddress: data.collectBillingAddress ?? false,
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
                coverImageUrl: (data as any).service.coverImageUrl,
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
      ...(data.serviceType === "FUNDRAISING" && data.fundraising
        ? {
            fundraising: {
              create: {
                targetAmount: (data.fundraising.targetAmount as any) ?? null,
                coverImageUrl: data.fundraising.coverImageUrl,
              },
            },
          }
        : {}),
    },
    include: { service: true, product: true, fundraising: true },
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
    include: { service: true, product: true, fundraising: true },
  });
  if (!existing || existing.userId !== userId) {
    const e: any = new Error("Not found");
    e.status = 404;
    throw e;
  }

  const next: any = { ...data };
  // If slug is being changed, ensure uniqueness
  if (typeof data.slug !== "undefined" && data.slug !== existing.slug) {
    next.slug = await ensureUniqueSlug(data.slug);
  }
  const targetType = data.serviceType ?? existing.serviceType;
  if (data.priceType) {
    next.amount =
      data.priceType === "FIXED" ? data.amount ?? existing.amount ?? 0 : null;
    next.minAmount =
      data.priceType === "FLEXIBLE"
        ? (data as any).minAmount ?? existing.minAmount ?? null
        : null;
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
                    coverImageUrl:
                      (data as any).service.coverImageUrl ?? undefined,
                  },
                }
              : {
                  create: {
                    title: data.service.title!,
                    description: data.service.description,
                    coverImageUrl: (data as any).service.coverImageUrl,
                  },
                },
          }
        : targetType !== "SERVICE" && existing.service
        ? { service: { delete: true } }
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
        : targetType !== "DIGITAL_PRODUCT" && existing.product
        ? { product: { delete: true } }
        : {}),
      ...(data.fundraising
        ? {
            fundraising: existing.fundraising
              ? {
                  update: {
                    targetAmount:
                      (data.fundraising.targetAmount as any) ?? undefined,
                    coverImageUrl: data.fundraising.coverImageUrl ?? undefined,
                  },
                }
              : {
                  create: {
                    targetAmount:
                      (data.fundraising.targetAmount as any) ?? null,
                    coverImageUrl: data.fundraising.coverImageUrl,
                  },
                },
          }
        : targetType !== "FUNDRAISING" && existing.fundraising
        ? { fundraising: { delete: true } }
        : {}),
    },
    include: { service: true, product: true, fundraising: true },
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

export async function findPublicPayLinkBySlug(slug: string) {
  return prisma.payLink.findFirst({
    where: { slug, active: true },
    select: {
      userId: true,
      id: true,
      name: true,
      slug: true,
      priceType: true,
      amount: true,
      minAmount: true,
      currency: true,
      active: true,
      serviceType: true,
      description: true,
      collectEmail: true,
      collectPhone: true,
      collectBillingAddress: true,
      mainColor: true,
      createdAt: true,
      updatedAt: true,
      service: {
        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          assets: false,
          coverImageUrl: true,
        },
      },
      fundraising: {
        select: {
          id: true,
          targetAmount: true,
          currentRaised: true,
          coverImageUrl: true,
        },
      },
    },
  });
}

export async function duplicatePayLink(userId: string, id: string) {
  // Ensure ownership and fetch with relations
  const existing = await prisma.payLink.findUnique({
    where: { id },
    include: { service: true, product: true, fundraising: true },
  });
  if (!existing || existing.userId !== userId) {
    const e: any = new Error("Not found");
    e.status = 404;
    throw e;
  }

  const newSlug = await ensureUniqueSlug(existing.slug);
  const newName = `${existing.name} (copy)`;

  const created = await prisma.payLink.create({
    data: {
      userId,
      name: newName,
      slug: newSlug,
      priceType: existing.priceType,
      amount: existing.amount,
      minAmount: existing.minAmount,
      currency: existing.currency,
      active: existing.active,
      serviceType: existing.serviceType,
      description: existing.description,
      collectEmail: existing.collectEmail,
      collectPhone: existing.collectPhone,
      collectBillingAddress: existing.collectBillingAddress,
      mainColor: existing.mainColor,
      ...(existing.service
        ? {
            service: {
              create: {
                title: existing.service.title,
                description: existing.service.description ?? undefined,
                coverImageUrl: existing.service.coverImageUrl ?? undefined,
              },
            },
          }
        : {}),
      ...(existing.product
        ? {
            product: {
              create: {
                name: existing.product.name,
                description: existing.product.description ?? undefined,
                assets: existing.product.assets as any,
                coverImageUrl: existing.product.coverImageUrl ?? undefined,
              },
            },
          }
        : {}),
      ...(existing.fundraising
        ? {
            fundraising: {
              create: {
                targetAmount: existing.fundraising.targetAmount ?? null,
                // Reset progress for duplicated fundraising
                currentRaised: 0,
                coverImageUrl: existing.fundraising.coverImageUrl ?? undefined,
              },
            },
          }
        : {}),
    },
    include: { service: true, product: true, fundraising: true },
  });

  return created as any;
}
