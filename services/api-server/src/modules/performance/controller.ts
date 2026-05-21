import type { Request, Response } from "express";
import {
  performanceNoteCreateSchema,
  performanceNotesQuerySchema,
} from "@toppers/validations";
import { performanceService } from "./service";

export const performanceController = {
  async createPerformanceNote(request: Request, response: Response) {
    const input = performanceNoteCreateSchema.parse(request.body);
    const note = await performanceService.createPerformanceNote(
      request.auth!,
      input,
    );

    response.status(201).json({
      success: true,
      data: note,
      message: "Performance note created successfully",
    });
  },

  async getPerformanceNotes(request: Request, response: Response) {
    const params = performanceNotesQuerySchema.parse(request.params);
    const notes = await performanceService.getPerformanceNotes(
      request.auth!,
      params.studentId,
    );

    response.json({
      success: true,
      data: notes,
      message: "Performance notes retrieved successfully",
    });
  },
};
