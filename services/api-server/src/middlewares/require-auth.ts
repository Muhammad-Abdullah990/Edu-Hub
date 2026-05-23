import type { NextFunction, Request, Response } from "express";
import {
  hasPermission,
  type PermissionName,
  type PlatformRole,
} from "@toppers/auth";
import { auditService } from "../modules/audit/service";
import { HttpError } from "../lib/http-error";
import { verifyAccessToken } from "../lib/security";

function resolveBearerToken(request: Request) {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length);
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const token = resolveBearerToken(request);
  if (!token) {
    return next(
      new HttpError(401, "AUTHENTICATION_REQUIRED", "Authentication required"),
    );
  }

  try {
    request.auth = verifyAccessToken(token);
    return next();
  } catch {
    return next(new HttpError(401, "INVALID_ACCESS_TOKEN", "Invalid access token"));
  }
}

function ensureAuthenticated(request: Request, next: NextFunction): boolean {
  if (request.auth) {
    return true;
  }

  const token = resolveBearerToken(request);
  if (!token) {
    next(
      new HttpError(401, "AUTHENTICATION_REQUIRED", "Authentication required"),
    );
    return false;
  }

  try {
    request.auth = verifyAccessToken(token);
    return true;
  } catch {
    next(new HttpError(401, "INVALID_ACCESS_TOKEN", "Invalid access token"));
    return false;
  }
}

export function requireRoles(...roles: PlatformRole[]) {
  return async function guard(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    if (!ensureAuthenticated(request, next)) {
      return;
    }

    const auth = request.auth!;
    const allowed = auth.roles.some((role) => roles.includes(role));
    if (allowed) {
      return next();
    }

    await auditService.log({
      userId: auth.userId,
      action: "auth.role_violation",
      entityType: "route",
      metadata: {
        path: request.path,
        requiredRoles: roles,
        actualRoles: auth.roles,
      },
    });

    return next(new HttpError(403, "ROLE_FORBIDDEN", "Role not permitted"));
  };
}

export function requirePermissions(...permissions: PermissionName[]) {
  return async function guard(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    if (!ensureAuthenticated(request, next)) {
      return;
    }

    const auth = request.auth!;
    const allowed = permissions.every((permission) =>
      hasPermission(auth.permissions, permission),
    );
    if (allowed) {
      return next();
    }

    await auditService.log({
      userId: auth.userId,
      action: "auth.permission_violation",
      entityType: "route",
      metadata: {
        path: request.path,
        requiredPermissions: permissions,
        actualPermissions: auth.permissions,
      },
    });

    return next(
      new HttpError(403, "PERMISSION_FORBIDDEN", "Permission not granted"),
    );
  };
}

export function requireSelfOrPermissions(...permissions: PermissionName[]) {
  return async function guard(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    if (!ensureAuthenticated(request, next)) {
      return;
    }

    const auth = request.auth!;
    if (auth.userId === request.params.id) {
      return next();
    }

    return requirePermissions(...permissions)(request, _response, next);
  };
}
