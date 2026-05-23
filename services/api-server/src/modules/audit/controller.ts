import type { Request, Response } from "express";
import { auditRepository } from "./repository";

export const auditController = {
  async listRecent(request: Request, response: Response) {
    const limit = Math.min(Number(request.query.limit ?? 50), 200);
    const logs = await auditRepository.listRecent(limit);

    response.json({
      success: true,
      data: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user?.name ?? null,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata,
        createdAt: log.timestamp.toISOString(),
      })),
      message: "Audit logs retrieved successfully",
    });
  },
};
