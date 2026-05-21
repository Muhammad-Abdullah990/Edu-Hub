import assert from "node:assert/strict";
import express from "express";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";

process.env.JWT_ACCESS_SECRET ??=
  "test-secret-value-that-is-at-least-thirty-two-characters";
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";

async function testLoginSuccess() {
  const { createAuthService } = await import("../modules/auth/service");
  const { hashSecret } = await import("../lib/security");
  const { ROLE_NAMES, USER_STATUS } = await import("@toppers/auth");

  const passwordHash = await hashSecret("Password123!");
  const authService = createAuthService({
    repository: {
      async findUserByEmail() {
        return {
          id: "user-1",
          name: "Admin",
          email: "admin@toppers.com",
          passwordHash,
          status: USER_STATUS.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          primaryRole: {
            id: 1,
            name: ROLE_NAMES.SUPER_ADMIN,
            description: "Super admin",
            permissions: [],
          },
          roles: [
            {
              id: 1,
              name: ROLE_NAMES.SUPER_ADMIN,
              description: "Super admin",
              permissions: [],
            },
          ],
          permissions: ["admin:manage"],
        };
      },
      async findUserById() {
        return {
          id: "user-1",
          name: "Admin",
          email: "admin@toppers.com",
          passwordHash,
          status: USER_STATUS.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          primaryRole: {
            id: 1,
            name: ROLE_NAMES.SUPER_ADMIN,
            description: "Super admin",
            permissions: [],
          },
          roles: [
            {
              id: 1,
              name: ROLE_NAMES.SUPER_ADMIN,
              description: "Super admin",
              permissions: [],
            },
          ],
          permissions: ["admin:manage"],
        };
      },
      async touchLastLogin() {},
    },
    sessions: {
      async createSession() {
        return {
          sessionId: "11111111-1111-1111-1111-111111111111",
          refreshToken: "session-1.refresh",
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        };
      },
      async verifyRefreshToken() {
        throw new Error("not used");
      },
      async rotateRefreshToken() {
        throw new Error("not used");
      },
      async revokeSession() {},
      async revokeAllUserSessions() {},
    },
    audit: {
      async log() {},
    },
  });

  const result = await authService.login({
    email: "admin@toppers.com",
    password: "Password123!",
  });

  assert.ok(result.accessToken);
  assert.equal(result.user.email, "admin@toppers.com");
}

async function testLoginFailure() {
  const { createAuthService } = await import("../modules/auth/service");
  const { hashSecret } = await import("../lib/security");
  const { ROLE_NAMES, USER_STATUS } = await import("@toppers/auth");

  const passwordHash = await hashSecret("Password123!");
  const authService = createAuthService({
    repository: {
      async findUserByEmail() {
        return {
          id: "user-1",
          name: "Admin",
          email: "admin@toppers.com",
          passwordHash,
          status: USER_STATUS.ACTIVE,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          primaryRole: {
            id: 1,
            name: ROLE_NAMES.SUPER_ADMIN,
            description: "Super admin",
            permissions: [],
          },
          roles: [
            {
              id: 1,
              name: ROLE_NAMES.SUPER_ADMIN,
              description: "Super admin",
              permissions: [],
            },
          ],
          permissions: ["admin:manage"],
        };
      },
      async findUserById() {
        return null;
      },
      async touchLastLogin() {},
    },
    sessions: {
      async createSession() {
        throw new Error("should not create session");
      },
      async verifyRefreshToken() {
        throw new Error("not used");
      },
      async rotateRefreshToken() {
        throw new Error("not used");
      },
      async revokeSession() {},
      async revokeAllUserSessions() {},
    },
    audit: {
      async log() {},
    },
  });

  await assert.rejects(
    () =>
      authService.login({
        email: "admin@toppers.com",
        password: "wrong-password",
      }),
    /Invalid credentials/,
  );
}

async function testTokenValidation() {
  const { signAccessToken, verifyAccessToken } = await import("../lib/security");

  const token = signAccessToken({
    sub: "user-1",
    sid: "session-1",
    email: "teacher@toppers.com",
    roles: ["TEACHER"],
    permissions: ["attendance:write"],
    status: "active",
  });

  const decoded = verifyAccessToken(token);
  assert.equal(decoded.userId, "user-1");
  assert.equal(decoded.sessionId, "session-1");
}

async function testRoleRestriction() {
  const { signAccessToken } = await import("../lib/security");
  const { requireAuth, requireRoles } = await import("../middlewares/require-auth");
  const { auditService } = await import("../modules/audit/service");

  const app = express();
  const token = signAccessToken({
    sub: "user-1",
    sid: "session-1",
    email: "student@toppers.com",
    roles: ["STUDENT"],
    permissions: ["student-dashboard:read:self"],
    status: "active",
  });

  auditService.log = async () => {};

  app.get("/admin", requireAuth, requireRoles("SUPER_ADMIN"), (_req, res) => {
    res.json({ ok: true });
  });

  app.use(
    (
      error: { statusCode?: number; message: string },
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      res.status(error.statusCode ?? 500).json({ message: error.message });
    },
  );

  const response = await request(app)
    .get("/admin")
    .set("Authorization", `Bearer ${token}`);

  assert.equal(response.status, 403);
}

async function testSessionExpiration() {
  const { createSessionsService } = await import("../modules/sessions/service");

  const service = createSessionsService({
    async create() {},
    async findById() {
      return null;
    },
    async rotate() {},
    async revoke() {},
    async revokeAllForUser() {},
    async findActiveById() {
      return null;
    },
  } as never);

  await assert.rejects(
    () => service.verifyRefreshToken("session-1.invalid"),
    /Session is no longer active/,
  );
}

async function main() {
  await testLoginSuccess();
  await testLoginFailure();
  await testTokenValidation();
  await testRoleRestriction();
  await testSessionExpiration();
  console.log("Auth and RBAC tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
