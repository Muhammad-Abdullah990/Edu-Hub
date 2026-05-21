import type { Request } from "express";

export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",", 1)[0]?.trim() ?? null;
  }

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.trim() ?? null;
  }

  return request.ip ?? null;
}

export function getDeviceInfo(request: Request): string | null {
  const deviceInfo = request.headers["sec-ch-ua-platform"];
  return typeof deviceInfo === "string" ? deviceInfo : null;
}
