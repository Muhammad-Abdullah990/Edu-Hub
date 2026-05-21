import type { Request, Response } from "express";
import {
  reportDownloadParamsSchema,
  reportGenerateRequestSchema,
  reportStudentParamsSchema,
} from "@toppers/validations";
import { reportsService } from "./service";

export const reportsController = {
  async generateReport(request: Request, response: Response) {
    const input = reportGenerateRequestSchema.parse(request.body);
    const result = await reportsService.queueReportGeneration(
      request.auth!,
      input,
    );

    response.status(202).json({
      success: true,
      data: result,
      message: "Report generation queued successfully",
    });
  },

  async getStudentReports(request: Request, response: Response) {
    const params = reportStudentParamsSchema.parse(request.params);
    const reports = await reportsService.getReportsByStudent(
      request.auth!,
      params.studentId,
    );

    response.json({
      success: true,
      data: reports,
      message: "Student report history loaded successfully",
    });
  },

  async downloadReport(request: Request, response: Response) {
    const params = reportDownloadParamsSchema.parse(request.params);
    const report = await reportsService.getReportById(
      request.auth!,
      params.reportId,
    );

    response.download(
      report.generatedPdfPath as string,
      `progress-report-${report.studentId}-${report.month}.pdf`,
    );
  },
};
