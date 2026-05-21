import { Router } from "express";
import { ROLE_NAMES } from "@toppers/auth";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth, requireRoles } from "../../middlewares/require-auth";
import { feesController } from "./controller";

export const feesRoutes = Router();

feesRoutes.get(
  "/fees/records",
  requireAuth,
  asyncHandler(feesController.listFeeRecords),
);

feesRoutes.post(
  "/fees/records",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
  ),
  requireAuth,
  asyncHandler(feesController.createFeeRecord),
);

feesRoutes.get(
  "/fees/records/:id",
  requireAuth,
  asyncHandler(feesController.getFeeRecordById),
);

feesRoutes.patch(
  "/fees/records/:id",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
  ),
  requireAuth,
  asyncHandler(feesController.updateFeeRecordById),
);

feesRoutes.post(
  "/fees/records/:id/reminders",
  requireRoles(
    ROLE_NAMES.SUPER_ADMIN,
    ROLE_NAMES.ADMIN,
  ),
  requireAuth,
  asyncHandler(feesController.createFeeReminder),
);
