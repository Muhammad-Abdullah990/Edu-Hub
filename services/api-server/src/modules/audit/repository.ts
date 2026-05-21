import { db, auditLogsTable } from "@toppers/db";
import type { AuditLogInput } from "./types";

export const auditRepository = {
  async create(entry: AuditLogInput) {
    await db.insert(auditLogsTable).values({
      userId: entry.userId ?? null,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    });
  },
};
