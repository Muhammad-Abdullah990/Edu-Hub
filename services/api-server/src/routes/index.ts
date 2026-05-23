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
import metricsRouter from "../modules/metrics/router";
import dashboardRouter from "../modules/admin/dashboard-router";
import { auditRoutes } from "../modules/audit/routes";
import { sessionsRoutes } from "../modules/sessions/routes";
import healthRouter from "./health";
import debugRouter from "./debug";
import { env } from "../lib/env";

const router: IRouter = Router();

// Health checks
router.use(healthRouter);

if (env.NODE_ENV === "development") {
  router.use(debugRouter);
}

// Core API routes
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
router.use(auditRoutes);
router.use(sessionsRoutes);

// Operational endpoints
router.use("/admin", dashboardRouter);
router.use(metricsRouter);

export default router;

