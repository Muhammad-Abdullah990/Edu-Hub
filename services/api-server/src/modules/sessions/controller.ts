import type { Request, Response } from "express";
import { HttpError } from "../../lib/http-error";
import { sessionsRepository } from "./repository";
import { sessionsService } from "./service";

export const sessionsController = {
  async listMySessions(request: Request, response: Response) {
    const sessions = await sessionsRepository.listActiveForUser(request.auth!.userId);

    response.json({
      success: true,
      data: sessions.map((session) => ({
        id: session.id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt: session.expiresAt.toISOString(),
        lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
        createdAt: session.createdAt.toISOString(),
      })),
      message: "Active sessions retrieved successfully",
    });
  },

  async revokeSession(request: Request, response: Response) {
    const sessionId = String(request.params.id);
    const session = await sessionsRepository.findById(sessionId);

    if (!session || session.userId !== request.auth!.userId) {
      throw new HttpError(404, "SESSION_NOT_FOUND", "Session not found");
    }

    await sessionsService.revokeSession(sessionId);

    response.json({
      success: true,
      data: null,
      message: "Session revoked successfully",
    });
  },
};
