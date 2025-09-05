import { z } from "zod";

export const UpdateSettingsBodySchema = z.object({
  autoPayouts: z.boolean().optional(),
  payoutInterval: z.enum(["daily", "weekly", "monthly", "manual"]).optional(),
  emailNotifications: z.boolean().optional(),
  bankIban: z.string().trim().min(1).max(128).optional(),
  bankAccountName: z.string().trim().min(1).max(128).optional(),
  bankName: z.string().trim().min(1).max(128).optional(),
});

export type UpdateSettingsBody = z.infer<typeof UpdateSettingsBodySchema>;
