import { describe, test } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_ACCESS_SECRET ??=
  "test-secret-value-that-is-at-least-thirty-two-characters";
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";

describe("sessions service", () => {
  test("rejects expired or missing sessions during refresh verification", async () => {
    const { createSessionsService } = await import("./service");

    const sessionsService = createSessionsService({
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
      () => sessionsService.verifyRefreshToken("session-1.invalid"),
      /Session is no longer active/,
    );
  });
});
