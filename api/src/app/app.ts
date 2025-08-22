import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { errorHandler } from "../middleware/error-handler.js";
import { router } from "./routes.js";

export function buildApp() {
  const app = express();

  // request logging (compact)
  app.use(
    pinoHttp({
      // cast to avoid pino type generics mismatch
      logger: logger as any,
      autoLogging: {
        // skip health and static-like
        ignore: (req) =>
          req.url === "/health" ||
          req.url?.startsWith("/favicon") ||
          req.url?.startsWith("/assets"),
      },
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
          };
        },
        res(res) {
          return { statusCode: res.statusCode };
        },
      },
      customLogLevel: function (res) {
        const code = res.statusCode ?? 0;
        if (code >= 500) return "error";
        if (code >= 400) return "warn";
        return "info";
      },
      customSuccessMessage: function (req, res) {
        const code = res.statusCode ?? 0;
        return `${req.method} ${req.url} -> ${code}`;
      },
      customErrorMessage: function (req, res, err) {
        const code = res.statusCode ?? 0;
        return `${req.method} ${req.url} -> ${code} (${
          err?.message ?? "error"
        })`;
      },
    })
  );
  app.use(helmet());
  app.use(cors({ origin: env.APP_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  // rate limit auth endpoints
  app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/v1", router);

  app.use(errorHandler);

  return app;
}
