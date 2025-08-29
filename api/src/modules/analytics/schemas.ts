import { z } from "zod";

export const RangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  interval: z.enum(["day", "month"]).default("day").optional(),
});

export type RangeQuery = z.infer<typeof RangeQuerySchema>;
