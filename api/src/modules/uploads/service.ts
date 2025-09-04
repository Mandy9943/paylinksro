import { randomUUID } from "node:crypto";
import path from "node:path";
import {
  presignGetUrl,
  presignPutUrl,
  r2ObjectUrl,
} from "../../lib/r2.js";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";

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

export async function listUserLogos(userId: string, limit = 50) {
  const prefix = `users/${userId}/paylinks/images/`;
  const cmd = new ListObjectsV2Command({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Prefix: prefix,
    MaxKeys: Math.min(Math.max(limit, 1), 1000),
  });
  const res = await (await import("../../lib/r2.js")).r2.send(cmd);
  const items = (res.Contents || [])
    .filter((obj) => !!obj.Key)
    .sort((a, b) => {
      const at = a.LastModified?.getTime() || 0;
      const bt = b.LastModified?.getTime() || 0;
      return bt - at;
    })
    .map((obj) => {
      const key = obj.Key as string;
      return {
        key,
        url: r2ObjectUrl(key),
        size: obj.Size ?? null,
        lastModified: obj.LastModified?.toISOString() ?? null,
      };
    });
  return items;
}
