/**
 * PDF Generation Service
 * Manages async PDF generation workflows
 * Uses background job queue for scalability
 */

import { getQueueService, JobType, JobPayload } from "./queue";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

/**
 * PDF Generation Request Payload
 */
export interface PDFGenerationPayload extends JobPayload {
  studentId: string;
  reportType: "monthly" | "attendance" | "fee";
  month?: string;
  year?: number;
  data: {
    studentName: string;
    parentName: string;
    attendance?: number;
    fees?: Record<string, any>;
    notes?: string;
    [key: string]: any;
  };
}

/**
 * PDF Report Template
 */
export interface PDFTemplate {
  name: string;
  path: string;
  variables: string[];
}

/**
 * Generated Report Metadata
 */
export interface GeneratedReport {
  id: string;
  jobId: string;
  studentId: string;
  reportType: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  checksum: string;
  generatedAt: string;
  metadata: Record<string, any>;
}

/**
 * PDF Generation Service
 */
export class PDFGenerationService {
  private get queueService() {
    return getQueueService();
  }
  private templates: Map<string, PDFTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize PDF templates
   */
  private initializeTemplates(): void {
    this.templates.set("monthly-report", {
      name: "Monthly Report",
      path: "/templates/monthly-report.html",
      variables: [
        "studentName",
        "parentName",
        "attendance",
        "teacherNotes",
        "strengths",
        "weaknesses",
        "recommendations",
      ],
    });

    this.templates.set("attendance-report", {
      name: "Attendance Report",
      path: "/templates/attendance-report.html",
      variables: ["studentName", "parentName", "attendancePercentage", "details"],
    });

    this.templates.set("fee-report", {
      name: "Fee Report",
      path: "/templates/fee-report.html",
      variables: ["studentName", "parentName", "feeDetails", "balance", "dueDate"],
    });
  }

  /**
   * Queue PDF generation job
   * Returns immediately with job ID
   */
  async generateReport(
    studentId: string,
    reportType: "monthly" | "attendance" | "fee",
    data: PDFGenerationPayload["data"],
  ): Promise<{ jobId: string; statusUrl: string }> {
    const correlationId = uuidv4();
    const userId = "system"; // TODO: Get from context

    const payload: PDFGenerationPayload = {
      correlationId,
      userId,
      timestamp: new Date().toISOString(),
      studentId,
      reportType,
      data,
    };

    const jobId = await this.queueService.enqueue(
      JobType.GENERATE_MONTHLY_REPORT,
      payload,
    );

    logger.info(
      { jobId, studentId, reportType, correlationId },
      "PDF generation job queued",
    );

    return {
      jobId,
      statusUrl: `/api/reports/${jobId}/status`,
    };
  }

  /**
   * Get report generation status
   */
  async getReportStatus(jobId: string) {
    const status = await this.queueService.getJobStatus(
      JobType.GENERATE_MONTHLY_REPORT,
      jobId,
    );

    if (!status) {
      return null;
    }

    return {
      jobId: status.id,
      status: status.state,
      progress: status.progress,
      attempts: status.attempts,
      maxAttempts: status.maxAttempts,
    };
  }

  /**
   * Validate template exists
   */
  validateTemplate(reportType: string): boolean {
    return this.templates.has(reportType);
  }

  /**
   * Get template
   */
  getTemplate(reportType: string): PDFTemplate | undefined {
    return this.templates.get(reportType);
  }
}

// Singleton instance
let pdfGenerationServiceInstance: PDFGenerationService | null = null;

export function getPDFGenerationService(): PDFGenerationService {
  if (!pdfGenerationServiceInstance) {
    pdfGenerationServiceInstance = new PDFGenerationService();
  }
  return pdfGenerationServiceInstance;
}
