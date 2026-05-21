import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { communicationsController } from "./controller";

export const communicationsRoutes = Router();

communicationsRoutes.get(
  "/communications/queue",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.TEACHER,
  ),
  requireAuth,
  asyncHandler(communicationsController.listQueueItems),
);

communicationsRoutes.get(
  "/communications/queue/:id",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.TEACHER,
  ),
  requireAuth,
  asyncHandler(communicationsController.getQueueItemById),
);

communicationsRoutes.post(
  "/communications/queue",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
    ROLE_NAMES.TEACHER,
  ),
  requireAuth,
  asyncHandler(communicationsController.createQueueItem),
);

communicationsRoutes.post(
  "/communications/queue/:id/review",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
  ),
  requireAuth,
  asyncHandler(communicationsController.reviewQueueItem),
);

communicationsRoutes.get(
  "/communications/history",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
  ),
  requireAuth,
  asyncHandler(communicationsController.listNotificationHistory),
);
