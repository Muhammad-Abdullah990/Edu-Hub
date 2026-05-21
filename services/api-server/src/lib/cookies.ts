import type { Response } from "express";
import { AUTH_COOKIE_NAMES, AUTH_POLICY } from "@toppers/auth";
import { isProduction } from "./env";

export function setRefreshCookie(response: Response, refreshToken: string) {
  response.cookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: AUTH_POLICY.COOKIE_PATH,
    maxAge: AUTH_POLICY.REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function setCsrfCookie(response: Response, csrfToken: string) {
  response.cookie(AUTH_COOKIE_NAMES.CSRF_TOKEN, csrfToken, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict",
    path: AUTH_POLICY.COOKIE_PATH,
    maxAge: AUTH_POLICY.REFRESH_TOKEN_TTL_SECONDS * 1000,
  });
}

export function clearAuthCookies(response: Response) {
  response.clearCookie(AUTH_COOKIE_NAMES.REFRESH_TOKEN, {
    path: AUTH_POLICY.COOKIE_PATH,
  });
  response.clearCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN, {
    path: AUTH_POLICY.COOKIE_PATH,
  });
}
