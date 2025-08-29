import { z } from "zod";

export const UpdateSettingsBodySchema = z.object({
  autoPayouts: z.boolean().optional(),
  payoutInterval: z.enum(["daily", "weekly", "monthly", "manual"]).optional(),
  emailNotifications: z.boolean().optional(),
});

export type UpdateSettingsBody = z.infer<typeof UpdateSettingsBodySchema>;
