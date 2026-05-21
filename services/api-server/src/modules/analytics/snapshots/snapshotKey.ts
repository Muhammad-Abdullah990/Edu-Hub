import type { SnapshotKeyInput } from "./snapshotTypes";

export function buildSnapshotKey(input: SnapshotKeyInput): string {
  // Schema-first: analytics_snapshots.snapshot_key is unique; keep it stable.
  const parts = [
    input.tenantId,
    input.domain,
    input.snapshotPeriod,
    input.studentId ?? "*",
    input.classId ?? "*",
    input.section ?? "*",
    String(input.version ?? 1),
  ];
  return parts.join(":");
}

