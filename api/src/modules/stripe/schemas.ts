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

export const ListPayoutsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  startingAfter: z.string().optional(),
});

export const CreatePayoutBodySchema = z.object({
  amount: z.coerce.number().positive(), // major units (RON)
  currency: z.string().default("ron"),
  statementDescriptor: z.string().max(22).optional(),
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
export type ListPayoutsQuery = z.infer<typeof ListPayoutsQuerySchema>;
export type CreatePayoutBody = z.infer<typeof CreatePayoutBodySchema>;
