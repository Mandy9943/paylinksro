import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error({ err }, "Unhandled error");

  const status = err?.status ?? 500;
  const message = err?.message ?? "Internal Server Error";
  const code = err?.code;

  res.status(status).json({ error: { message, code } });
};
