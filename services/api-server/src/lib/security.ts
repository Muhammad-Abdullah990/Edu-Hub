import argon2 from "argon2";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import { AUTH_POLICY } from "@toppers/auth";
import { env } from "./env";

export interface AccessTokenPayload {
  sub: string;
  sid: string;
  email: string;
  roles: string[];
  permissions: string[];
  status: string;
}

export async function hashSecret(value: string): Promise<string> {
  return argon2.hash(value);
}

export async function verifySecret(
  hash: string,
  value: string,
): Promise<boolean> {
  return argon2.verify(hash, value);
}

export function createOpaqueToken(
  bytes: number = AUTH_POLICY.REFRESH_TOKEN_BYTES,
) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: AUTH_POLICY.ACCESS_TOKEN_TTL_SECONDS,
  });
}

export function verifyAccessToken(token: string): AuthenticatedPrincipal {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

  return {
    userId: decoded.sub,
    sessionId: decoded.sid,
    email: decoded.email,
    roles: decoded.roles as AuthenticatedPrincipal["roles"],
    permissions: decoded.permissions as AuthenticatedPrincipal["permissions"],
    status: decoded.status as AuthenticatedPrincipal["status"],
  };
}
