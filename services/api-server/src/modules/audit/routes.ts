import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireRoles } from "../../middlewares/require-auth";
import { auditController } from "./controller";

export const auditRoutes = Router();

auditRoutes.get(
  "/audit/logs",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN),
  asyncHandler(auditController.listRecent),
);
