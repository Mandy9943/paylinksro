import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

export interface AuthedRequest extends Request {
  user?: { id: string; role: "USER" | "ADMIN" };
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer "))
      return res.status(401).json({ error: { message: "Unauthorized" } });
    const token = header.slice("Bearer ".length);
    const decoded = verifyJwt<{ sub: string; ver?: number }>(token);

    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user)
      return res.status(401).json({ error: { message: "Unauthorized" } });
    if (user.disabledAt)
      return res.status(403).json({ error: { message: "Account disabled" } });
    if ((decoded.ver ?? 0) !== user.tokenVersion)
      return res.status(401).json({ error: { message: "Token revoked" } });

    req.user = { id: user.id, role: user.role as any };
    next();
  } catch {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.role !== "ADMIN")
    return res.status(403).json({ error: { message: "Forbidden" } });
  next();
}
