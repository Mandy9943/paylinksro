import { z } from "zod";

export const RequestMagicLinkSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  redirectTo: z.string().url(),
  refCode: z.string().min(1).optional(),
});

export type RequestMagicLinkInput = z.infer<typeof RequestMagicLinkSchema>;

export const VerifyMagicLinkSchema = z.object({
  token: z.string().min(32),
  redirectTo: z.string().url().optional(),
  redirectToAfterAuth: z.string().optional(),
});

export type VerifyMagicLinkInput = z.infer<typeof VerifyMagicLinkSchema>;
