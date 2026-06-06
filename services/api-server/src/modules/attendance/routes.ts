import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { attendanceController } from "./controller";

export const attendanceRoutes = Router();

attendanceRoutes.post(
  "/attendance/mark-bulk",
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(attendanceController.markAttendance),
);

attendanceRoutes.get(
  "/attendance/all",
  requireAuth,
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(attendanceController.getAllAttendance),
);

attendanceRoutes.get(
  "/attendance/class/:classId",
  requireAuth,
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(attendanceController.getClassAttendance),
);

attendanceRoutes.get(
  "/attendance/student/:studentId",
  requireAuth,
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(attendanceController.getStudentAttendanceHistory),
);
