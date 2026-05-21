import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { parentsController } from "./controller";

export const parentsRoutes = Router({ mergeParams: true });

parentsRoutes.post(
  "/",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(parentsController.createParentForStudent),
);

parentsRoutes.get(
  "/",
  requireAuth,
  asyncHandler(parentsController.getParentsForStudent),
);
