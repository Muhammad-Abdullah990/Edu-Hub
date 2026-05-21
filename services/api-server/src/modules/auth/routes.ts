import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middlewares/require-auth";
import { requireCsrfToken } from "../../middlewares/require-csrf";
import { authController } from "./controller";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRoutes = Router();

authRoutes.post("/auth/login", authLimiter, asyncHandler(authController.login));
authRoutes.post(
  "/auth/refresh",
  authLimiter,
  requireCsrfToken,
  asyncHandler(authController.refresh),
);
authRoutes.get("/auth/me", requireAuth, asyncHandler(authController.me));
authRoutes.post(
  "/auth/logout",
  requireAuth,
  requireCsrfToken,
  asyncHandler(authController.logout),
);
authRoutes.post(
  "/auth/logout-all",
  requireAuth,
  requireCsrfToken,
  asyncHandler(authController.logoutAll),
);
