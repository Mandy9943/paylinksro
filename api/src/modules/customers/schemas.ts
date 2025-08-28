import { z } from "zod";

export const listCustomersQuerySchema = z.object({
  segment: z
    .enum([
      "all",
      "top",
      "first-time",
      "repeat",
      "recent",
      "high-refunds",
      "high-disputes",
    ])
    .default("all")
    .optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  cursor: z.string().optional(),
});

export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
