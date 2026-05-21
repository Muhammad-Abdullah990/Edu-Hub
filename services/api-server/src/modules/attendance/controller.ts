import type { Request, Response } from "express";
import {
  attendanceMarkBulkSchema,
  attendanceQuerySchema,
} from "@toppers/validations";
import { attendanceService } from "./service";

export const attendanceController = {
  async markAttendance(request: Request, response: Response) {
    const input = attendanceMarkBulkSchema.parse(request.body);
    const result = await attendanceService.markAttendanceBulk(
      request.auth!.userId,
      request.auth!,
      input,
    );

    response.status(201).json({
      success: true,
      data: result,
      message: "Attendance marked successfully",
    });
  },

  async getClassAttendance(request: Request, response: Response) {
    const query = attendanceQuerySchema.parse({
      classId: request.params.classId,
      ...request.query,
    });
    const date = query.date ?? new Date().toISOString().slice(0, 10);
    const records = await attendanceService.getClassAttendance(
      request.auth!,
      query.classId,
      date,
      query.section,
    );

    response.json({
      success: true,
      data: records,
      message: "Class attendance loaded successfully",
    });
  },
};
