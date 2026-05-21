import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { performanceController } from "./controller";

export const performanceRoutes = Router();

performanceRoutes.post(
  "/performance-notes",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(performanceController.createPerformanceNote),
);

performanceRoutes.get(
  "/performance-notes/student/:studentId",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  requireAuth,
  asyncHandler(performanceController.getPerformanceNotes),
);
