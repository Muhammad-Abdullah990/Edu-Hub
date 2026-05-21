import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE_NAMES, AUTH_HEADER_NAMES } from "@toppers/auth";
import { HttpError } from "../lib/http-error";

export function requireCsrfToken(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const cookieToken = request.cookies?.[AUTH_COOKIE_NAMES.CSRF_TOKEN];
  const headerToken = request.headers[AUTH_HEADER_NAMES.CSRF];

  if (
    !cookieToken ||
    typeof cookieToken !== "string" ||
    typeof headerToken !== "string" ||
    headerToken !== cookieToken
  ) {
    return next(new HttpError(403, "CSRF_TOKEN_INVALID", "Invalid CSRF token"));
  }

  next();
}
