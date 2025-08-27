import { z } from "zod";
import {
  createPaymentLinkSchema,
  paymentLinkTypeEnum,
  priceTypeEnum,
} from "./schema";

export type PaymentLinkType = z.infer<typeof paymentLinkTypeEnum>;
export type PriceType = z.infer<typeof priceTypeEnum>;
export type CreatePaymentLinkFormValues = z.infer<
  typeof createPaymentLinkSchema
>;
