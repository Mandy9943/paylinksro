import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validate(
  schema: ZodSchema<any>,
  property: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse((req as any)[property]);
    if (!result.success) {
      return res.status(400).json({
        error: "ValidationError",
        details: result.error.flatten(),
      });
    }
    // attach parsed data without mutating framework internals
    (req as any).validated = {
      ...(req as any).validated,
      [property]: result.data,
    };
    next();
  };
}
