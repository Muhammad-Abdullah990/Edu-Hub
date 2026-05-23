import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";
import { isOperationalError, normalizeError } from "./errors";

/**
 * Generate correlation ID for request tracing
 */
declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

/**
 * Correlation ID middleware
 * Adds unique ID to all requests for tracing and debugging
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  req.correlationId = req.headers["x-correlation-id"] as string || uuidv4();
  res.setHeader("x-correlation-id", req.correlationId);
  next();
}

/**
 * Global error handler middleware
 * Catches all errors and returns normalized JSON responses
 */
export function globalErrorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const error = normalizeError(err);

  // Log error with correlation ID
  logger.error(
    {
      correlationId: req.correlationId,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        context: error.context,
        stack: error.stack,
      },
      request: {
        method: req.method,
        path: req.path,
        query: req.query,
      },
    },
    "Request error",
  );

  // Send normalized error response
  res.status(error.statusCode).json({
    error: {
      code: error.code,
      message: error.message,
      correlationId: req.correlationId,
      ...(process.env.NODE_ENV === "development" && {
        stack: error.stack,
        context: error.context,
      }),
    },
  });
}

/**
 * Async error wrapper for route handlers
 * Catches errors in async handlers and passes to error middleware
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown> | void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      next(err);
    });
  };
}

/**
 * 404 handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
      correlationId: req.correlationId,
    },
  });
}
