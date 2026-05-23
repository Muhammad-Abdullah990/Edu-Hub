/**
 * Report Generation Router
 * Endpoints for async PDF report generation
 */

import { Router, Request, Response } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { getPDFGenerationService } from "../../lib/pdf-service";
import { logger } from "../../lib/logger";
import { ValidationError, NotFoundError } from "../../lib/errors";

const router = Router();
const pdfService = getPDFGenerationService();

/**
 * POST /api/reports/generate
 * Queue a new report generation job
 */
router.post(
  "/generate",
  requireAuth,
  requireRoles(ROLE_NAMES.SUPER_ADMIN, ROLE_NAMES.ADMIN, ROLE_NAMES.TEACHER),
  asyncHandler(async (req: Request, res: Response) => {
    const { studentId, reportType, data } = req.body;

    // Validation
    if (!studentId) {
      throw new ValidationError("studentId is required");
    }

    if (!["monthly", "attendance", "fee"].includes(reportType)) {
      throw new ValidationError("Invalid reportType");
    }

    if (!pdfService.validateTemplate(reportType)) {
      throw new ValidationError(`No template available for reportType: ${reportType}`);
    }

    // Queue the job
    const result = await pdfService.generateReport(studentId, reportType, data);

    res.status(202).json({
      success: true,
      jobId: result.jobId,
      status: "queued",
      statusUrl: result.statusUrl,
    });
  }),
);

/**
 * GET /api/reports/:jobId/status
 * Get report generation status
 */
router.get(
  "/:jobId/status",
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;

    const status = await pdfService.getReportStatus(jobId);

    if (!status) {
      throw new NotFoundError("Report generation job", jobId);
    }

    res.json({
      success: true,
      jobId: status.jobId,
      status: status.status,
      progress: status.progress,
      attempts: status.attempts,
      maxAttempts: status.maxAttempts,
    });
  }),
);

export default router;