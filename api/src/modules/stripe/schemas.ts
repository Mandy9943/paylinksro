import { z } from "zod";

export const AccountIdParamSchema = z.object({
  id: z.string().min(1, "Missing account id"),
});

export const CreateAccountSessionBodySchema = z
  .object({
    component: z.enum(["onboarding", "management"]).optional(),
  })
  .default({});

export const CreateProductBodySchema = z.object({
  accountId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  currency: z.string().default("usd"),
});

export const ListProductsQuerySchema = z.object({
  accountId: z.string().min(1),
});

export const CreatePaymentIntentBodySchema = z.object({
  accountId: z.string().min(1),
  priceId: z.string().min(1),
  quantity: z.coerce.number().int().positive().default(1),
  applicationFeeAmount: z.coerce.number().int().nonnegative().optional(),
});

export type AccountIdParam = z.infer<typeof AccountIdParamSchema>;
export type CreateAccountSessionBody = z.infer<
  typeof CreateAccountSessionBodySchema
>;
export type CreateProductBody = z.infer<typeof CreateProductBodySchema>;
export type ListProductsQuery = z.infer<typeof ListProductsQuerySchema>;
export type CreatePaymentIntentBody = z.infer<
  typeof CreatePaymentIntentBodySchema
>;
