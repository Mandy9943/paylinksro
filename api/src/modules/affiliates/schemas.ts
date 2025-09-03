import { z } from "zod";

export const PaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export const PayoutRequestBodySchema = z.object({
  bankDetails: z.string().min(1).max(2000).optional(),
}); // v1: always sweep all available, optional bank details per request

export type PayoutRequestBody = z.infer<typeof PayoutRequestBodySchema>;
