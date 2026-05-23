import type { Request, Response } from "express";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "./validation";
import { usersService } from "./service";

export const usersController = {
  async listUsers(request: Request, response: Response) {
    const limit = Math.min(Number(request.query.limit ?? 100), 200);
    const users = await usersService.listUsers(limit);
    response.json({
      success: true,
      data: users,
      message: "Users retrieved successfully",
    });
  },

  async createUser(request: Request, response: Response) {
    const input = createUserSchema.parse(request.body);
    const user = await usersService.createUser(request.auth!.userId, input);
    response.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  },

  async getUserById(request: Request, response: Response) {
    const { id } = userIdParamSchema.parse(request.params);
    response.json(await usersService.getUserById(id));
  },

  async updateUserById(request: Request, response: Response) {
    const { id } = userIdParamSchema.parse(request.params);
    const input = updateUserSchema.parse(request.body);
    response.json(await usersService.updateUser(request.auth!.userId, id, input));
  },

  async deleteUserById(request: Request, response: Response) {
    const { id } = userIdParamSchema.parse(request.params);
    response.json(await usersService.deleteUser(request.auth!.userId, id));
  },
};
