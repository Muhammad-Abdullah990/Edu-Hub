import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requirePermissions } from "../../middlewares/require-auth";
import { PERMISSION_NAMES } from "@toppers/auth";
import { rbacController } from "./controller";

export const rbacRoutes = Router();

rbacRoutes.get(
  "/roles",
  requirePermissions(PERMISSION_NAMES.ROLES_READ),
  asyncHandler(rbacController.listRoles),
);
rbacRoutes.get(
  "/permissions",
  requirePermissions(PERMISSION_NAMES.PERMISSIONS_READ),
  asyncHandler(rbacController.listPermissions),
);
