import { z } from "zod";

const imageTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
] as const;

const assetTypes = [
  ...imageTypes,
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
] as const;

export const getPresignSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("paylink-image"),
    filename: z.string().min(1).max(255),
    contentType: z.enum(imageTypes as unknown as [string, ...string[]]),
  }),
  z.object({
    kind: z.literal("digital-asset"),
    filename: z.string().min(1).max(255),
    contentType: z.enum(assetTypes as unknown as [string, ...string[]]),
  }),
]);

export type GetPresignInput = z.infer<typeof getPresignSchema>;

export const getDownloadSchema = z.object({
  key: z.string().min(1),
  expiresIn: z.coerce
    .number()
    .int()
    .positive()
    .max(3600)
    .default(300)
    .optional(),
});
