import type { Request, Response } from "express";
import { rbacService } from "./service";

export const rbacController = {
  async listRoles(_request: Request, response: Response) {
    response.json(await rbacService.listRoles());
  },

  async listPermissions(_request: Request, response: Response) {
    response.json(await rbacService.listPermissions());
  },
};
