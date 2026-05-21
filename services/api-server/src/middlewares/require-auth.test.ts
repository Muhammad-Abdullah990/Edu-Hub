import { describe, test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import request from "supertest";

process.env.JWT_ACCESS_SECRET ??=
  "test-secret-value-that-is-at-least-thirty-two-characters";
process.env.DATABASE_URL ??= "postgres://test:test@localhost:5432/test";

describe("auth middleware", () => {
  test("validates bearer token", async () => {
    const { signAccessToken } = await import("../lib/security");
    const { requireAuth } = await import("./require-auth");

    const app = express();
    const token = signAccessToken({
      sub: "user-1",
      sid: "session-1",
      email: "teacher@toppers.com",
      roles: ["TEACHER"],
      permissions: ["attendance:write"],
      status: "active",
    });

    app.get("/secure", requireAuth, (req, res) => {
      res.json({ userId: req.auth?.userId });
    });

    const response = await request(app)
      .get("/secure")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.userId, "user-1");
  });

  test("blocks unauthorized roles", async () => {
    const { signAccessToken } = await import("../lib/security");
    const { requireAuth, requireRoles } = await import("./require-auth");

    const app = express();
    const token = signAccessToken({
      sub: "user-1",
      sid: "session-1",
      email: "student@toppers.com",
      roles: ["STUDENT"],
      permissions: ["student-dashboard:read:self"],
      status: "active",
    });

    app.get(
      "/admin",
      requireAuth,
      requireRoles("SUPER_ADMIN"),
      (_req, res) => {
        res.json({ ok: true });
      },
    );

    const response = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${token}`);

    assert.equal(response.status, 403);
  });
});
