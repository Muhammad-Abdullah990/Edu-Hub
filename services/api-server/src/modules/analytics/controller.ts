import type { Request, Response } from "express";
import {
  classAnalyticsParamsSchema,
  studentAnalyticsParamsSchema,
} from "@toppers/validations";
import { analyticsService } from "./service";

export const analyticsController = {
  async getSummary(request: Request, response: Response) {
    const summary = await analyticsService.getDashboardSummary(request.auth!);

    response.json({
      success: true,
      data: summary,
      message: "Analytics dashboard summary retrieved successfully",
    });
  },

  async getStudentAttendance(request: Request, response: Response) {
    const params = studentAnalyticsParamsSchema.parse(request.params);
    const analytics = await analyticsService.getStudentAttendanceAnalytics(
      request.auth!,
      params.studentId,
    );

    response.json({
      success: true,
      data: analytics,
      message: "Student attendance analytics retrieved successfully",
    });
  },

  async getClassAttendanceSummary(request: Request, response: Response) {
    const params = classAnalyticsParamsSchema.parse({
      classId: request.params.classId,
      ...request.query,
    });
    const date = params.date ?? new Date().toISOString().slice(0, 10);
    const summary = await analyticsService.getClassAttendanceSummary(
      request.auth!,
      params.classId,
      date,
      params.section,
    );

    response.json({
      success: true,
      data: summary,
      message: "Class attendance summary retrieved successfully",
    });
  },
};
