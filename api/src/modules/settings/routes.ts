import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { UpdateSettingsBodySchema } from "./schemas.js";
import { getMySettingsHandler, updateMySettingsHandler } from "./controller.js";

export const settingsRouter = Router();

settingsRouter.get("/me", requireAuth, getMySettingsHandler);
settingsRouter.put("/me", requireAuth, validate(UpdateSettingsBodySchema), updateMySettingsHandler);
