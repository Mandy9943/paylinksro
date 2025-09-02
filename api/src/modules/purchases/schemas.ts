import { z } from "zod";

export const listPurchasesSchema = z.object({});

export const presignDownloadSchema = z.object({
  payLinkId: z.string().min(1),
  key: z.string().min(1),
});

export type PresignDownloadBody = z.infer<typeof presignDownloadSchema>;
