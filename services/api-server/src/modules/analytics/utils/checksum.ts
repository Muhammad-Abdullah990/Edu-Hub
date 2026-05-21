import { createHash } from "crypto";

export function computeJsonChecksum(data: unknown): string {
  // Deterministic checksum for snapshot immutability/auditability.
  return createHash("sha256")
    .update(JSON.stringify(data))
    .digest("hex");
}

