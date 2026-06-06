import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { analyticsController } from "./controller";

export const analyticsRoutes = Router();

analyticsRoutes.get(
  "/analytics/summary",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  requireAuth,
  asyncHandler(analyticsController.getSummary),
);

analyticsRoutes.get(
  "/analytics/student/:studentId/attendance",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  requireAuth,
  asyncHandler(analyticsController.getStudentAttendance),
);

analyticsRoutes.get(
  "/analytics/class/:classId/summary",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  requireAuth,
  asyncHandler(analyticsController.getClassAttendanceSummary),
);
