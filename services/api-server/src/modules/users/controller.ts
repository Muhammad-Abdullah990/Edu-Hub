import type { Request, Response } from "express";
import { createUserSchema, updateUserSchema, userIdParamSchema } from "./validation";
import { usersService } from "./service";

export const usersController = {
  async createUser(request: Request, response: Response) {
    const input = createUserSchema.parse(request.body);
    const user = await usersService.createUser(request.auth!.userId, input);
    response.status(201).json(user);
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
