import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middlewares/require-auth";
import { sessionsController } from "./controller";

export const sessionsRoutes = Router();

sessionsRoutes.get(
  "/sessions/me",
  requireAuth,
  asyncHandler(sessionsController.listMySessions),
);

sessionsRoutes.post(
  "/sessions/:id/revoke",
  requireAuth,
  asyncHandler(sessionsController.revokeSession),
);
