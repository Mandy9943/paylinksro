import { z } from "zod";

export const RequestMagicLinkSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  redirectTo: z.string().url(),
});

export type RequestMagicLinkInput = z.infer<typeof RequestMagicLinkSchema>;

export const VerifyMagicLinkSchema = z.object({
  token: z.string().min(32),
  redirectTo: z.string().url().optional(),
});

export type VerifyMagicLinkInput = z.infer<typeof VerifyMagicLinkSchema>;
