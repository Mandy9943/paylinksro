import type { Request, Response } from "express";
import { AuthedRequest } from "../../middleware/auth.js";
import { getUserSettings, updateUserSettings } from "./service.js";

export async function getMySettingsHandler(req: AuthedRequest, res: Response) {
  const userId = req.user!.id;
  const data = await getUserSettings(userId);
  res.json({ settings: data });
}

export async function updateMySettingsHandler(req: AuthedRequest, res: Response) {
  const userId = req.user!.id;
  const body = (req as any).validated?.body as Partial<{
    autoPayouts: boolean;
    payoutInterval: "daily" | "weekly" | "monthly" | "manual";
    emailNotifications: boolean;
  }>;
  const data = await updateUserSettings(userId, body);
  res.json({ settings: data });
}
