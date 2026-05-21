import type { Request, Response } from "express";
import { AUTH_COOKIE_NAMES } from "@toppers/auth";
import { clearAuthCookies, setCsrfCookie, setRefreshCookie } from "../../lib/cookies";
import { getClientIp, getDeviceInfo } from "../../lib/request-utils";
import { authService } from "./service";
import { loginSchema } from "./validation";

export const authController = {
  async login(request: Request, response: Response) {
    const input = loginSchema.parse(request.body);
    const result = await authService.login({
      ...input,
      ipAddress: getClientIp(request),
      userAgent: request.headers["user-agent"] ?? null,
      deviceInfo: getDeviceInfo(request),
    });

    setRefreshCookie(response, result.refreshToken);
    setCsrfCookie(response, result.csrfToken);

    response.json({
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
      user: result.user,
    });
  },

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies?.[AUTH_COOKIE_NAMES.REFRESH_TOKEN];
    const result = await authService.refresh(refreshToken);

    setRefreshCookie(response, result.refreshToken);
    setCsrfCookie(response, result.csrfToken);

    response.json({
      accessToken: result.accessToken,
      csrfToken: result.csrfToken,
      user: result.user,
    });
  },

  async me(request: Request, response: Response) {
    response.json(await authService.me(request.auth));
  },

  async logout(request: Request, response: Response) {
    clearAuthCookies(response);
    const refreshToken = request.cookies?.[AUTH_COOKIE_NAMES.REFRESH_TOKEN];
    response.json(await authService.logout(request.auth, refreshToken));
  },

  async logoutAll(request: Request, response: Response) {
    clearAuthCookies(response);
    response.json(await authService.logoutAll(request.auth));
  },
};
