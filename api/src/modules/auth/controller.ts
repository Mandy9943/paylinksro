import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { requestMagicLink, verifyMagicLink } from "./service.js";

export async function requestLinkHandler(req: Request, res: Response) {
  const { email, redirectTo } = (req as any).validated?.body as {
    email: string;
    redirectTo?: string;
  };
  const result = await requestMagicLink(email, redirectTo);
  res.json(result);
}

export async function verifyLinkHandler(req: Request, res: Response) {
  const { token, redirectTo } = (req as any).validated?.query as {
    token: string;
    redirectTo?: string;
  };
  const result = await verifyMagicLink(token);

  // If redirectTo provided, ensure it's within APP_ORIGIN to prevent open redirects
  if (redirectTo) {
    try {
      const url = new URL(redirectTo);
      const appOrigin = new URL(env.APP_ORIGIN);
      if (url.origin === appOrigin.origin) {
        // Attach token in URL fragment to avoid sending it to servers via Referer
        url.hash = `token=${encodeURIComponent(result.token)}`;
        return res.redirect(302, url.toString());
      } else {
        return res.status(400).json({ error: "Invalid redirect URL" });
      }
    } catch {
      // fall back to JSON below on invalid URL
    }
  }

  // Fallback: return JSON with token
  res.json({ token: result.token });
}
