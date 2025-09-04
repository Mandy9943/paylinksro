import { z } from "zod";
import { FEES } from "../../config/fees.js";

export const priceTypeEnum = z.enum(["FIXED", "FLEXIBLE"]);
export const serviceTypeEnum = z.enum([
  "SERVICE",
  "DIGITAL_PRODUCT",
  "DONATION",
  "FUNDRAISING",
]);

const createPayLinkBase = z.object({
  name: z.string().min(1),
  displayName: z.string().max(200).optional(),
  subtitle: z.string().max(300).optional(),
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
  addVat: z.boolean().optional(),
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

export const createPayLinkSchema = createPayLinkBase.superRefine((val, ctx) => {
  if (val.priceType === "FIXED") {
    if (
      val.amount == null ||
      val.amount * 100 < FEES.MIN_TRANSACTION_RON * 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
      });
    }
  }
  if (val.priceType === "FLEXIBLE") {
    if (val.minAmount && val.minAmount * 100 < FEES.MIN_TRANSACTION_RON * 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["minAmount"],
        message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
      });
    }
  }
  // Digital products must collect buyer email
  if (val.serviceType === "DIGITAL_PRODUCT" && val.collectEmail !== true) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["collectEmail"],
      message: "Digital products require collecting the buyer's email.",
    });
  }
});

export const updatePayLinkSchema = createPayLinkBase
  .partial()
  .superRefine((val, ctx) => {
    // When updating, if the link is set to DIGITAL_PRODUCT (or already is) and collectEmail is provided and false, reject.
    if (val.serviceType === "DIGITAL_PRODUCT" && val.collectEmail === false) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["collectEmail"],
        message: "Digital products require collecting the buyer's email.",
      });
    }
  });

export const listQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
});

export const createPublicPaymentIntentSchema = z.object({
  amount: z.coerce
    .number()
    .positive()
    .refine((v) => v * 100 >= FEES.MIN_TRANSACTION_RON * 100, {
      message: `Minimum amount is ${FEES.MIN_TRANSACTION_RON} RON`,
    })
    .optional(), // RON; required for FLEXIBLE/DONATION/FUNDRAISING
  email: z.string().email().optional(),
  addVat: z.boolean().optional(),
});

export type CreatePayLinkInput = z.infer<typeof createPayLinkSchema>;
export type UpdatePayLinkInput = z.infer<typeof updatePayLinkSchema>;
export type CreatePublicPaymentIntentInput = z.infer<
  typeof createPublicPaymentIntentSchema
>;
