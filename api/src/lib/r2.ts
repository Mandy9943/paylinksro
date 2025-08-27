import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";

const endpoint = `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;

export const r2 = new S3Client({
  region: "auto",
  endpoint,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

export function r2ObjectUrl(key: string) {
  if (env.R2_PUBLIC_BASE_URL) return `${env.R2_PUBLIC_BASE_URL}/${key}`;
  // Fallback to S3 endpoint (may not be publicly accessible without signed URLs)
  return `${endpoint}/${env.CLOUDFLARE_R2_BUCKET_NAME}/${key}`;
}

export async function presignPutUrl({
  key,
  contentType,
  expiresInSeconds = 600,
}: {
  key: string;
  contentType?: string;
  expiresInSeconds?: number;
}) {
  const cmd = new PutObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(r2, cmd, { expiresIn: expiresInSeconds });
  return url;
}

export async function presignGetUrl({
  key,
  expiresInSeconds = 300,
}: {
  key: string;
  expiresInSeconds?: number;
}) {
  const cmd = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });
  const url = await getSignedUrl(r2, cmd, { expiresIn: expiresInSeconds });
  return url;
}
