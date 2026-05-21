import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { parentsRoutes } from "../parents/routes";
import { studentsController } from "./controller";

export const studentsRoutes = Router();

studentsRoutes.post(
  "/students",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(studentsController.createStudent),
);

studentsRoutes.get(
  "/students",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(studentsController.getStudents),
);

studentsRoutes.get(
  "/students/:id",
  requireAuth,
  asyncHandler(studentsController.getStudentById),
);

studentsRoutes.put(
  "/students/:id",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(studentsController.updateStudent),
);

studentsRoutes.post(
  "/students/:id/archive",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(studentsController.archiveStudent),
);

studentsRoutes.post(
  "/students/:id/restore",
  requireRoles(ROLE_NAMES.ADMIN, ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(studentsController.restoreStudent),
);

studentsRoutes.delete(
  "/students/:id",
  requireRoles(ROLE_NAMES.SUPER_ADMIN),
  asyncHandler(studentsController.deleteStudent),
);

studentsRoutes.use("/students/:id/parents", parentsRoutes);
