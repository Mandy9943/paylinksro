import { z } from "zod";

export const listTransactionsQuerySchema = z.object({
  status: z
    .enum([
      "all",
      "succeeded",
      "failed",
      "refunded",
      "disputed",
      "uncaptured",
      "requires_action",
    ])
    .default("all")
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  cursor: z.string().optional(),
});

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>;
