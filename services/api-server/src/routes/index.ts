import { Router, type IRouter } from "express";
import { authRoutes } from "../modules/auth/routes";
import { rbacRoutes } from "../modules/rbac/routes";
import { studentsRoutes } from "../modules/students/routes";
import { usersRoutes } from "../modules/users/routes";
import { attendanceRoutes } from "../modules/attendance/routes";
import { performanceRoutes } from "../modules/performance/routes";
import { analyticsRoutes } from "../modules/analytics/routes";
import { communicationsRoutes } from "../modules/communications/routes";
import { feesRoutes } from "../modules/fees/routes";
import { reportsRoutes } from "../modules/reports/routes";
import healthRouter from "./health";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRoutes);
router.use(usersRoutes);
router.use(studentsRoutes);
router.use(attendanceRoutes);
router.use(performanceRoutes);
router.use(analyticsRoutes);
router.use(feesRoutes);
router.use(communicationsRoutes);
router.use(reportsRoutes);
router.use(rbacRoutes);

export default router;

