/**
 * Dashboard Router
 * Internal operational dashboard endpoints
 */

import { Router, Request, Response } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/error-handler";
import { getDashboardService } from "../../lib/dashboard-service";
import { getAutomationService } from "../../lib/automation-service";
import { logger } from "../../lib/logger";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";

const router = Router();
const adminGuard = [requireAuth, requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN)];

router.use(adminGuard);

/**
 * GET /admin/dashboard
 * Get comprehensive system status
 */
router.get(
  "/dashboard",
  asyncHandler(async (req: Request, res: Response) => {
    const dashboardService = getDashboardService();
    const status = await dashboardService.getStatus();
    return res.json(status);
  }),
);

/**
 * GET /admin/workflows/pending
 * Get pending automation workflows awaiting approval
 */
router.get(
  "/workflows/pending",
  asyncHandler(async (req: Request, res: Response) => {
    const automationService = getAutomationService();
    const pending = automationService.getPendingWorkflows();

    return res.json({
      count: pending.length,
      workflows: pending,
    });
  }),
);

/**
 * POST /admin/workflows/:workflowId/approve
 * Approve and send a pending workflow
 */
router.post(
  "/workflows/:workflowId/approve",
  asyncHandler(async (req: Request, res: Response) => {
    const workflowId = String(req.params.workflowId);
    const approvedBy = Array.isArray(req.body.approvedBy)
      ? req.body.approvedBy[0]
      : req.body.approvedBy;

    if (!approvedBy) {
      return res.status(400).json({ error: "approvedBy is required" });
    }

    const automationService = getAutomationService();
    await automationService.approveAndSendWorkflow(workflowId, String(approvedBy));

    logger.info({ workflowId, approvedBy }, "Workflow approved via dashboard");

    return res.json({
      status: "approved_and_sent",
      workflowId,
    });
  }),
);

/**
 * POST /admin/workflows/:workflowId/reject
 * Reject a pending workflow
 */
router.post(
  "/workflows/:workflowId/reject",
  asyncHandler(async (req: Request, res: Response) => {
    const workflowId = String(req.params.workflowId);
    const reason = Array.isArray(req.body.reason) ? req.body.reason[0] : req.body.reason;

    if (!reason) {
      return res.status(400).json({ error: "reason is required" });
    }

    const automationService = getAutomationService();
    await automationService.rejectWorkflow(workflowId, String(reason));

    logger.info({ workflowId, reason }, "Workflow rejected via dashboard");

    return res.json({
      status: "rejected",
      workflowId,
    });
  }),
);

/**
 * GET /admin/workflows/history
 * Get workflow history
 */
router.get(
  "/workflows/history",
  asyncHandler(async (req: Request, res: Response) => {
    const { limit = "50" } = req.query;
    const automationService = getAutomationService();
    const history = automationService.getRecentWorkflows(parseInt(limit as string));

    res.json({
      count: history.length,
      workflows: history,
    });
  }),
);

/**
 * GET /admin/system-info
 * Get detailed system information
 */
router.get(
  "/system-info",
  asyncHandler(async (req: Request, res: Response) => {
    const dashboardService = getDashboardService();
    const status = await dashboardService.getStatus();

    res.json({
      timestamp: status.timestamp,
      systemHealth: status.systemHealth,
      performance: status.performance,
      uptime: status.performance.uptime,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
    });
  }),
);

export default router;
