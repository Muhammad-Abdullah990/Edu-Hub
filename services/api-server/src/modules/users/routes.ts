import { Router } from "express";
import { PERMISSION_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requirePermissions, requireSelfOrPermissions } from "../../middlewares/require-auth";
import { usersController } from "./controller";

export const usersRoutes = Router();

usersRoutes.post(
  "/users",
  requirePermissions(PERMISSION_NAMES.USERS_WRITE),
  asyncHandler(usersController.createUser),
);
usersRoutes.get(
  "/users/:id",
  requireSelfOrPermissions(PERMISSION_NAMES.USERS_READ),
  asyncHandler(usersController.getUserById),
);
usersRoutes.patch(
  "/users/:id",
  requireSelfOrPermissions(PERMISSION_NAMES.USERS_WRITE),
  asyncHandler(usersController.updateUserById),
);
usersRoutes.delete(
  "/users/:id",
  requirePermissions(PERMISSION_NAMES.USERS_DELETE),
  asyncHandler(usersController.deleteUserById),
);
