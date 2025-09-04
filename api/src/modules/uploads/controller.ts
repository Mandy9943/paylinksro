import type { NextFunction, Request, Response } from "express";
import { presignGetUrl } from "../../lib/r2.js";
import { getDownloadSchema } from "./schemas.js";
import { getPresignedUpload, listUserLogos } from "./service.js";

export async function presignUploadController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { kind, filename, contentType } = (req as any).validated.body as {
      kind: "paylink-image" | "digital-asset";
      filename: string;
      contentType: string;
    };

    const userId = (req as any).user?.id as string;
    const result = await getPresignedUpload(
      userId,
      kind,
      filename,
      contentType
    );
    res.json({
      uploadUrl: result.url,
      key: result.key,
      publicUrl: result.publicUrl,
      downloadUrl: result.downloadUrl,
      contentType: result.contentType,
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadUrlController(req: any, res: any, next: any) {
  try {
    const { key, expiresIn } = getDownloadSchema.parse(
      req.validated?.body ?? req.body
    );
    // Optional: verify ownership by key prefix users/<userId>/... here if desired
    const userId = req.user?.id as string;
    if (!key.startsWith(`users/${userId}/`)) {
      return res.status(403).json({ error: { message: "Forbidden" } });
    }
    const url = await presignGetUrl({
      key,
      expiresInSeconds: expiresIn ?? 300,
    });
    res.json({ downloadUrl: url });
  } catch (err) {
    next(err);
  }
}

export async function listLogosController(
  req: any,
  res: any,
  next: any
) {
  try {
    const userId = req.user?.id as string;
    const limit = Number(req.query.limit ?? 50);
    const items = await listUserLogos(userId, isNaN(limit) ? 50 : limit);
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
