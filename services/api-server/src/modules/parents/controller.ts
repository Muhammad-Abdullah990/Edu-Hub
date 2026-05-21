import type { Request, Response } from "express";
import { createParentSchema, studentIdParamSchema } from "./validation";
import { parentsService } from "./service";

export const parentsController = {
  async createParentForStudent(request: Request, response: Response) {
    const parentInput = createParentSchema.parse(request.body);
    const { id } = studentIdParamSchema.parse(request.params);
    const parent = await parentsService.createParentForStudent(
      request.auth!.userId,
      id,
      parentInput,
    );
    response.status(201).json({
      success: true,
      data: parent,
      message: "Parent created and linked to student successfully",
    });
  },

  async getParentsForStudent(request: Request, response: Response) {
    const { id } = studentIdParamSchema.parse(request.params);
    const parents = await parentsService.getParentsForStudent(request.auth!, id);
    response.json({
      success: true,
      data: parents,
      message: "Parents retrieved successfully",
    });
  },
};
