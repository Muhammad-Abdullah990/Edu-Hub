import {
  AUTH_POLICY,
  PermissionName,
  USER_STATUS,
} from "@toppers/auth";
import { HttpError } from "../../lib/http-error";
import { signAccessToken, verifySecret, createOpaqueToken } from "../../lib/security";
import { auditService } from "../audit/service";
import { sessionsService } from "../sessions/service";
import { authRepository } from "./repository";
import type { AuthResponseUser } from "./types";

function mapUser(
  user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>,
  session: { id: string; expiresAt: Date },
): AuthResponseUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    primaryRole: {
      id: user.primaryRole.id,
      name: user.primaryRole.name,
      description: user.primaryRole.description,
      permissions: user.primaryRole.permissions,
    },
    roles: user.roles.map((role: NonNullable<typeof user>["roles"][number]) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })),
    permissions: user.permissions as PermissionName[],
    session: {
      id: session.id,
      expiresAt: session.expiresAt.toISOString(),
    },
  };
}

function createAccessTokenForUser(user: NonNullable<Awaited<ReturnType<typeof authRepository.findUserById>>>, sessionId: string) {
  return signAccessToken({
    sub: user.id,
    sid: sessionId,
    email: user.email,
    roles: user.roles.map((role: NonNullable<typeof user>["roles"][number]) => role.name),
    permissions: user.permissions as string[],
    status: user.status,
  });
}

export function createAuthService(dependencies?: {
  repository?: typeof authRepository;
  sessions?: typeof sessionsService;
  audit?: typeof auditService;
}) {
  const repository = dependencies?.repository ?? authRepository;
  const sessions = dependencies?.sessions ?? sessionsService;
  const audit = dependencies?.audit ?? auditService;

  return {
    async login(input: {
      email: string;
      password: string;
      ipAddress?: string | null;
      userAgent?: string | null;
      deviceInfo?: string | null;
    }) {
      const user = await repository.findUserByEmail(input.email);
      const failedAuditBase = {
        action: "auth.login_failed",
        entityType: "auth",
        metadata: { email: input.email, ipAddress: input.ipAddress ?? null },
      } as const;

      if (!user) {
        await audit.log(failedAuditBase);
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        await audit.log({
          ...failedAuditBase,
          userId: user.id,
        });
        throw new HttpError(403, "USER_INACTIVE", "User is inactive");
      }

      const passwordValid = await verifySecret(user.passwordHash, input.password);
      if (!passwordValid) {
        await audit.log({
          ...failedAuditBase,
          userId: user.id,
        });
        throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
      }

      const session = await sessions.createSession({
        userId: user.id,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        deviceInfo: input.deviceInfo,
      });

      await repository.touchLastLogin(user.id);

      await audit.log({
        userId: user.id,
        action: "auth.login_success",
        entityType: "session",
        entityId: session.sessionId,
        metadata: { ipAddress: input.ipAddress ?? null },
      });

      const freshUser = await repository.findUserById(user.id);
      if (!freshUser) {
        throw new HttpError(404, "USER_NOT_FOUND", "User not found");
      }

      return {
        accessToken: createAccessTokenForUser(freshUser, session.sessionId),
        refreshToken: session.refreshToken,
        csrfToken: createOpaqueToken(AUTH_POLICY.CSRF_TOKEN_BYTES),
        user: mapUser(freshUser, {
          id: session.sessionId,
          expiresAt: session.expiresAt,
        }),
      };
    },

    async refresh(refreshToken?: string) {
      if (!refreshToken) {
        throw new HttpError(401, "MISSING_REFRESH_TOKEN", "Refresh token missing");
      }

      const session = await sessions.verifyRefreshToken(refreshToken);
      const user = await repository.findUserById(session.userId);

      if (!user || user.status !== USER_STATUS.ACTIVE) {
        throw new HttpError(401, "INVALID_SESSION_USER", "User session invalid");
      }

      const rotated = await sessions.rotateRefreshToken(session.id);

      return {
        accessToken: createAccessTokenForUser(user, session.id),
        refreshToken: rotated.refreshToken,
        csrfToken: createOpaqueToken(AUTH_POLICY.CSRF_TOKEN_BYTES),
        user: mapUser(user, {
          id: session.id,
          expiresAt: rotated.expiresAt,
        }),
      };
    },

    async me(principal: Express.Request["auth"]) {
      if (!principal) {
        throw new HttpError(401, "UNAUTHENTICATED", "Authentication required");
      }

      const user = await repository.findUserById(principal.userId);
      if (!user) {
        throw new HttpError(404, "USER_NOT_FOUND", "User not found");
      }

      return mapUser(user, {
        id: principal.sessionId,
        expiresAt: new Date(Date.now() + AUTH_POLICY.ACCESS_TOKEN_TTL_SECONDS * 1000),
      });
    },

    async logout(
      principal: Express.Request["auth"] | undefined,
      refreshToken?: string,
    ) {
      if (refreshToken) {
        try {
          const session = await sessions.verifyRefreshToken(refreshToken);
          await sessions.revokeSession(session.id);
        } catch {
          // Ignore invalid refresh tokens during logout to allow cookie cleanup.
        }
      }

      if (principal) {
        await audit.log({
          userId: principal.userId,
          action: "auth.logout",
          entityType: "session",
          entityId: principal.sessionId,
        });
      }

      return {
        status: "ok",
        message: "Logged out successfully",
      };
    },

    async logoutAll(principal: Express.Request["auth"]) {
      if (!principal) {
        throw new HttpError(401, "UNAUTHENTICATED", "Authentication required");
      }

      await sessions.revokeAllUserSessions(principal.userId);
      await audit.log({
        userId: principal.userId,
        action: "auth.logout_all",
        entityType: "user",
        entityId: principal.userId,
      });

      return {
        status: "ok",
        message: "All sessions revoked successfully",
      };
    },
  };
}

export const authService = createAuthService();
