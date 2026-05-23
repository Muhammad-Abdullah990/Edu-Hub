import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error";
import {
  createStudentSchema,
  linkPortalUserSchema,
  studentIdParamSchema,
  studentListQuerySchema,
  studentSlugParamSchema,
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

  async getPublicStudents(request: Request, response: Response) {
    const result = await studentsService.getPublicStudents();
    response.json({
      success: true,
      data: result.students,
      message: "Public students retrieved successfully",
    });
  },

  async getPublicStudentBySlug(request: Request, response: Response) {
    const { slug } = studentSlugParamSchema.parse(request.params);
    const student = await studentsService.getPublicStudentBySlug(slug);
    response.json({
      success: true,
      data: student,
      message: "Public student profile retrieved successfully",
    });
  },

  async getMyStudentProfile(request: Request, response: Response) {
    const student = await studentsService.getMyStudentProfile(request.auth!);
    response.json({
      success: true,
      data: student,
      message: "Linked student profile retrieved successfully",
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

  async linkPortalUser(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const { portalUserId } = linkPortalUserSchema.parse(request.body);
    const result = await studentsService.linkPortalUser(
      request.auth!.userId,
      id,
      portalUserId,
    );
    response.json({
      success: true,
      data: result,
      message: "Portal user link updated successfully",
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
