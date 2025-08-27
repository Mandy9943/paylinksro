import { z } from "zod";

export const paymentLinkTypeEnum = z.enum([
  "servicii",
  "produse-digitale",
  "donatii",
  "fundraising",
]);

export const priceTypeEnum = z.enum(["fixed", "flexible"]);

export const createPaymentLinkSchema = z
  .object({
    type: paymentLinkTypeEnum,
    name: z.string().min(1, "Numele este obligatoriu"),
    description: z.string().optional().or(z.literal("")),
    priceType: priceTypeEnum,
    amount: z.number().nullable().optional(),
    minAmount: z.number().nullable().optional(),
    collectEmail: z.boolean().default(true),
    collectPhone: z.boolean().default(false),
    collectBillingAddress: z.boolean().default(false),
    mainColor: z.string().default("#fbbf24"),
    // Upload results
    productAssetUrls: z.array(z.string()).default([]),
    productCoverImageUrl: z.string().url().nullable().optional(),
    fundraisingCoverImageUrl: z.string().url().nullable().optional(),
    targetAmount: z.number().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.type !== "fundraising" && val.priceType === "fixed") {
      if (val.amount == null || val.amount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["amount"],
          message: "Introduceți o sumă > 0",
        });
      }
    }
    if (val.type !== "fundraising" && val.priceType === "flexible") {
      if (val.minAmount != null && val.minAmount < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minAmount"],
          message: "Suma minimă nu poate fi negativă",
        });
      }
    }
  });

export type CreatePaymentLinkSchema = typeof createPaymentLinkSchema;
