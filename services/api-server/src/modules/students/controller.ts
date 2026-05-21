import type { Request, Response } from "express";
import {
  createStudentSchema,
  studentIdParamSchema,
  studentListQuerySchema,
  updateStudentSchema,
} from "./validation";
import { studentsService } from "./service";

export const studentsController = {
  async createStudent(request: Request, response: Response) {
    const input = createStudentSchema.parse(request.body);
    const student = await studentsService.createStudent(request.auth!.userId, input);
    response.status(201).json({
      success: true,
      data: student,
      message: "Student created successfully",
    });
  },

  async getStudents(request: Request, response: Response) {
    const input = studentListQuerySchema.parse(request.query);
    const result = await studentsService.getStudents(input);
    response.json({
      success: true,
      data: result.students,
      meta: result.meta,
      message: "Students retrieved successfully",
    });
  },

  async getStudentById(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const student = await studentsService.getStudentById(request.auth!, id);
    response.json({
      success: true,
      data: student,
      message: "Student profile retrieved successfully",
    });
  },

  async updateStudent(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const input = updateStudentSchema.parse(request.body);
    const student = await studentsService.updateStudent(
      request.auth!.userId,
      request.auth!,
      id,
      input,
    );
    response.json({
      success: true,
      data: student,
      message: "Student updated successfully",
    });
  },

  async archiveStudent(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const result = await studentsService.archiveStudent(request.auth!.userId, id);
    response.json({
      success: true,
      data: null,
      message: result.message,
    });
  },

  async restoreStudent(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const result = await studentsService.restoreStudent(request.auth!.userId, id);
    response.json({
      success: true,
      data: null,
      message: result.message,
    });
  },

  async deleteStudent(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const result = await studentsService.deleteStudent(request.auth!.userId, id);
    response.json({
      success: true,
      data: null,
      message: result.message,
    });
  },
};
