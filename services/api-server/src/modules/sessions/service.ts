import crypto from "node:crypto";
import { AUTH_POLICY } from "@toppers/auth";
import { HttpError } from "../../lib/http-error";
import { createOpaqueToken, hashSecret, verifySecret } from "../../lib/security";
import { sessionsRepository } from "./repository";

function buildRefreshToken(sessionId: string) {
  return `${sessionId}.${createOpaqueToken()}`;
}

function parseSessionIdFromRefreshToken(refreshToken: string) {
  const [sessionId] = refreshToken.split(".", 1);
  return sessionId ?? null;
}

export function createSessionsService(repository = sessionsRepository) {
  return {
    async createSession(input: {
      userId: string;
      deviceInfo?: string | null;
      ipAddress?: string | null;
      userAgent?: string | null;
    }) {
      const sessionId = crypto.randomUUID();
      const refreshToken = buildRefreshToken(sessionId);
      const refreshTokenHash = await hashSecret(refreshToken);
      const expiresAt = new Date(
        Date.now() + AUTH_POLICY.REFRESH_TOKEN_TTL_SECONDS * 1000,
      );

      await repository.create({
        id: sessionId,
        userId: input.userId,
        refreshTokenHash,
        expiresAt,
        deviceInfo: input.deviceInfo,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      });

      return { sessionId, refreshToken, expiresAt };
    },

    async verifyRefreshToken(refreshToken: string) {
      const sessionId = parseSessionIdFromRefreshToken(refreshToken);
      if (!sessionId) {
        throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
      }

      const session = await repository.findActiveById(sessionId);
      if (!session) {
        throw new HttpError(401, "SESSION_EXPIRED", "Session is no longer active");
      }

      const valid = await verifySecret(session.refreshTokenHash, refreshToken);
      if (!valid) {
        throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Invalid refresh token");
      }

      return session;
    },

    async rotateRefreshToken(sessionId: string) {
      const refreshToken = buildRefreshToken(sessionId);
      const refreshTokenHash = await hashSecret(refreshToken);
      const expiresAt = new Date(
        Date.now() + AUTH_POLICY.REFRESH_TOKEN_TTL_SECONDS * 1000,
      );

      await repository.rotate(sessionId, refreshTokenHash, expiresAt);

      return { refreshToken, expiresAt };
    },

    async revokeSession(sessionId: string) {
      await repository.revoke(sessionId);
    },

    async revokeAllUserSessions(userId: string) {
      await repository.revokeAllForUser(userId);
    },
  };
}

export const sessionsService = createSessionsService();
