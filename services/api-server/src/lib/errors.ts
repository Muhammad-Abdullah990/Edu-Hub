/**
 * Operational Error Classes
 * Distinguishes between programmer errors and operational errors
 * Enables proper error handling and recovery strategies
 */

/**
 * Base class for operational errors
 * These are expected errors that can be recovered from
 */
export class OperationalError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "OperationalError";
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, OperationalError.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        ...(this.context && { context: this.context }),
      },
    };
  }
}

/**
 * Validation error - typically 400 Bad Request
 */
export class ValidationError extends OperationalError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 400, context);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error - typically 401 Unauthorized
 */
export class AuthenticationError extends OperationalError {
  constructor(message: string = "Authentication failed", context?: Record<string, unknown>) {
    super("AUTH_ERROR", message, 401, context);
    this.name = "AuthenticationError";
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error - typically 403 Forbidden
 */
export class AuthorizationError extends OperationalError {
  constructor(message: string = "Insufficient permissions", context?: Record<string, unknown>) {
    super("AUTHZ_ERROR", message, 403, context);
    this.name = "AuthorizationError";
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error - typically 404
 */
export class NotFoundError extends OperationalError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`;
    super("NOT_FOUND", message, 404, { resource, id });
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Conflict error - typically 409
 */
export class ConflictError extends OperationalError {
  constructor(message: string, context?: Record<string, unknown>) {
    super("CONFLICT", message, 409, context);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

/**
 * Rate limit error - typically 429
 */
export class RateLimitError extends OperationalError {
  constructor(message: string = "Rate limit exceeded", retryAfter?: number) {
    super("RATE_LIMIT", message, 429, retryAfter ? { retryAfter } : undefined);
    this.name = "RateLimitError";
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Service unavailable error - typically 503
 */
export class ServiceUnavailableError extends OperationalError {
  constructor(service: string, message?: string) {
    super(
      "SERVICE_UNAVAILABLE",
      message || `${service} is temporarily unavailable`,
      503,
      { service },
    );
    this.name = "ServiceUnavailableError";
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}

/**
 * Internal server error - typically 500
 */
export class InternalError extends OperationalError {
  constructor(message: string = "Internal server error", context?: Record<string, unknown>) {
    super("INTERNAL_ERROR", message, 500, context);
    this.name = "InternalError";
    Object.setPrototypeOf(this, InternalError.prototype);
  }
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: unknown): error is OperationalError {
  return error instanceof OperationalError;
}

/**
 * Convert any error to operational error with proper context preservation
 */
export function normalizeError(error: unknown, defaultMessage: string = "An unexpected error occurred"): OperationalError {
  if (isOperationalError(error)) {
    return error;
  }

  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof (error as any).statusCode === "number" &&
    "code" in error &&
    typeof (error as any).code === "string"
  ) {
    return new OperationalError(
      (error as any).code,
      error.message,
      (error as any).statusCode,
      "details" in (error as any) && (error as any).details
        ? { details: (error as any).details }
        : undefined,
    );
  }

  if (error instanceof Error) {
    return new InternalError(error.message, {
      originalError: error.name,
    });
  }

  return new InternalError(defaultMessage);
}
