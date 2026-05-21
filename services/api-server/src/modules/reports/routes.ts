import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { reportsController } from "./controller";

export const reportsRoutes = Router();

reportsRoutes.post(
  "/reports/generate",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.TEACHER,
  ),
  asyncHandler(reportsController.generateReport),
);

reportsRoutes.get(
  "/reports/student/:studentId",
  requireAuth,
  asyncHandler(reportsController.getStudentReports),
);

reportsRoutes.get(
  "/reports/download/:reportId",
  requireAuth,
  asyncHandler(reportsController.downloadReport),
);
