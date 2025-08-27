import { randomUUID } from "node:crypto";
import path from "node:path";
import { presignGetUrl, presignPutUrl, r2ObjectUrl } from "../../lib/r2.js";

export async function getPresignedUpload(
  userId: string,
  kind: "paylink-image" | "digital-asset",
  filename: string,
  contentType: string
) {
  const safeExt = extnameSafe(filename);
  const id = randomUUID();
  const kindPrefix =
    kind === "paylink-image" ? "paylinks/images" : "products/assets";
  const prefix = `users/${userId}/${kindPrefix}`;
  const key = `${prefix}/${id}${safeExt}`;

  const url = await presignPutUrl({ key, contentType, expiresInSeconds: 600 });
  // For paylink images we can return a permanent public URL
  const publicUrl = kind === "paylink-image" ? r2ObjectUrl(key) : undefined;
  // For digital assets, we keep them private; frontend should request a short-lived GET URL when needed
  const downloadUrl =
    kind === "digital-asset"
      ? await presignGetUrl({ key, expiresInSeconds: 300 })
      : undefined;
  return { url, key, publicUrl, downloadUrl, contentType };
}

function extnameSafe(name: string) {
  const ext = path.extname(name || "").toLowerCase();
  if (!ext) return "";
  // allow common image/video/doc types; default to .bin if weird
  if (
    /^\.(png|jpg|jpeg|gif|webp|svg|pdf|mp4|mp3|wav|zip|rar|7z|txt)$/i.test(ext)
  )
    return ext;
  return ".bin";
}
