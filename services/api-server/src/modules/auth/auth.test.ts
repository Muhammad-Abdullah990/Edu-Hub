import { describe, test } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_ACCESS_SECRET ??=
  "test-secret-value-that-is-at-least-thirty-two-characters";
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";

describe("auth service", () => {
  test("login succeeds with valid credentials", async () => {
    const { createAuthService } = await import("./service");
    const { hashSecret } = await import("../../lib/security");
    const { ROLE_NAMES, USER_STATUS } = await import("@toppers/auth");

    const passwordHash = await hashSecret("Password123!");
    const repository = {
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
    };

    const auditEvents: string[] = [];
    const authService = createAuthService({
      repository,
      sessions: {
        async createSession() {
          return {
            sessionId: "session-1",
            refreshToken: "session-1.refresh",
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
          };
        },
      } as never,
      audit: {
        async log(entry: { action: string }) {
          auditEvents.push(entry.action);
        },
      } as never,
    });

    const result = await authService.login({
      email: "admin@toppers.com",
      password: "Password123!",
    });

    assert.ok(result.accessToken);
    assert.equal(result.user.email, "admin@toppers.com");
    assert.deepEqual(auditEvents, ["auth.login_success"]);
  });

  test("login fails with invalid credentials", async () => {
    const { createAuthService } = await import("./service");
    const { hashSecret } = await import("../../lib/security");
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
      } as never,
      sessions: {
        async createSession() {
          throw new Error("should not create session");
        },
      } as never,
      audit: {
        async log() {},
      } as never,
    });

    await assert.rejects(
      () =>
        authService.login({
          email: "admin@toppers.com",
          password: "wrong-password",
        }),
      /Invalid credentials/,
    );
  });
});
