import { z } from "zod";

export const priceTypeEnum = z.enum(["FIXED", "FLEXIBLE"]);
export const serviceTypeEnum = z.enum([
  "SERVICE",
  "DIGITAL_PRODUCT",
  "DONATION",
  "FUNDRAISING",
]);

export const createPayLinkSchema = z.object({
  name: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  priceType: priceTypeEnum,
  amount: z.coerce.number().nonnegative().optional(), // RON, converted to bani server-side
  minAmount: z.coerce.number().nonnegative().optional(), // RON, converted to bani server-side (flexible)
  currency: z.string().default("RON").optional(),
  active: z.boolean().optional(),
  serviceType: serviceTypeEnum,
  description: z.string().max(10_000).optional(),
  collectEmail: z.boolean().optional(),
  collectPhone: z.boolean().optional(),
  collectBillingAddress: z.boolean().optional(),
  mainColor: z
    .string()
    .regex(/^#?[0-9a-fA-F]{3,8}$/)
    .optional(),
  service: z
    .object({
      title: z.string().min(1),
      description: z.string().max(10_000).optional(),
      coverImageUrl: z.string().url().optional(),
    })
    .optional(),
  product: z
    .object({
      name: z.string().min(1),
      description: z.string().max(10_000).optional(),
      assets: z.any().optional(),
      coverImageUrl: z.string().url().optional(),
    })
    .optional(),
  fundraising: z
    .object({
      targetAmount: z.coerce.number().nonnegative().optional(),
      coverImageUrl: z.string().url().optional(),
    })
    .optional(),
});

export const updatePayLinkSchema = createPayLinkSchema.partial();

export const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

export const createPublicPaymentIntentSchema = z.object({
  amount: z.coerce.number().positive().optional(), // RON; required for FLEXIBLE/DONATION/FUNDRAISING
  email: z.string().email().optional(),
});

export type CreatePayLinkInput = z.infer<typeof createPayLinkSchema>;
export type UpdatePayLinkInput = z.infer<typeof updatePayLinkSchema>;
export type CreatePublicPaymentIntentInput = z.infer<
  typeof createPublicPaymentIntentSchema
>;
