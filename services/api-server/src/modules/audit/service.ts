import type { AuditLogInput } from "./types";
import { auditRepository } from "./repository";

export function createAuditService(
  repository = auditRepository,
) {
  return {
    async log(entry: AuditLogInput) {
      await repository.create(entry);
    },
  };
}

export const auditService = createAuditService();
