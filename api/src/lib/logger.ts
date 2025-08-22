import pino from "pino";

export const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  // redact sensitive headers/fields
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      'req.headers["x-csrf-token"]',
      'req.headers["x-api-key"]',
      'res.headers["set-cookie"]',
    ],
    censor: "[REDACTED]",
  },
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty" as any,
          options: {
            colorize: true,
            translateTime: "SYS:HH:MM:ss",
            singleLine: true,
            // hide bulky objects, rely on custom messages from pino-http
            ignore: "pid,hostname,req,res,context,trace,span,reqId",
          },
        },
});
