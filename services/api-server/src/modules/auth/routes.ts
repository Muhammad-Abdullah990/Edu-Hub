import { Router } from "express";
import rateLimit from "express-rate-limit";
import { asyncHandler } from "../../lib/async-handler";
import { env } from "../../lib/env";
import { requireAuth } from "../../middlewares/require-auth";
import { requireCsrfToken } from "../../middlewares/require-csrf";
import { authController } from "./controller";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "development" ? 200 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "RATE_LIMIT",
    message: "Too many login attempts. Try again later.",
  },
});

export const authRoutes = Router();

authRoutes.post("/auth/login", loginLimiter, asyncHandler(authController.login));
authRoutes.post(
  "/auth/refresh",
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
