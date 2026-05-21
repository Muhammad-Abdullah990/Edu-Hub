import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../lib/logger";
import { HttpError, isHttpError } from "../lib/http-error";

export function notFoundHandler(
  _request: Request,
  _response: Response,
  next: NextFunction,
) {
  next(new HttpError(404, "NOT_FOUND", "Resource not found"));
}

export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return response.status(400).json({
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      issues: error.flatten(),
    });
  }

  if (isHttpError(error)) {
    return response.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details ?? null,
    });
  }

  logger.error({ err: error }, "Unhandled error");
  return response.status(500).json({
    code: "INTERNAL_SERVER_ERROR",
    message: "Something went wrong",
  });
}
