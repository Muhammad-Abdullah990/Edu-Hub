import { and, eq } from "drizzle-orm";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import {
  aiGeneratedSummariesTable,
  analyticsSnapshotsTable,
  attendanceAggregatesTable,
  db,
  studentRiskProfilesTable,
  studentScoresTable,
} from "@toppers/db";
import { z } from "zod";
import { computeJsonChecksum } from "../utils/checksum";
import type { AnalyticsSnapshotDomain } from "./snapshotTypes";
import { buildSnapshotKey } from "./snapshotKey";

const snapshotDataSchema = z
  .object({
    // Always keep datasets reviewable/auditable.
    computedAt: z.string().min(1),
    sources: z
      .object({
        studentScores: z.array(z.unknown()).optional(),
        studentRiskProfiles: z.array(z.unknown()).optional(),
        attendanceAggregates: z.array(z.unknown()).optional(),
      })
      .strict(),
    metrics: z.record(z.unknown()),
  })
  .strict();

export async function generateAttendanceSnapshot(options: {
  auth: AuthenticatedPrincipal;
  tenantId: string;
  studentId: string;
  classId?: string;
  section?: string | null;
  aggregatePeriod: string; // YYYY-MM
  snapshotPeriod?: string; // defaults to aggregatePeriod
  version?: number;
}): Promise<{ snapshotKey: string; snapshotId: string }> {
  const {
    auth,
    tenantId,
    studentId,
    classId,
    section,
    aggregatePeriod,
    version,
  } = options;

  if (!auth.tenantId || auth.tenantId !== tenantId) {
    // Keep confidentiality boundary: tenant isolation.
    // AuthenticatedPrincipal shape may vary; this is safe as a runtime guard.
    throw new Error("TENANT_MISMATCH");
  }

  const snapshotPeriod = options.snapshotPeriod ?? aggregatePeriod;
  const domain: AnalyticsSnapshotDomain = "attendance_analytics";

  const snapshotKey = buildSnapshotKey({
    tenantId,
    domain,
    snapshotPeriod,
    studentId,
    classId,
    section: section ?? null,
    version,
  });

  // Idempotent creation: if snapshot exists, return it.
  const existing = await db
    .select({ id: analyticsSnapshotsTable.id })
    .from(analyticsSnapshotsTable)
    .where(
      and(
        eq(analyticsSnapshotsTable.snapshotKey, snapshotKey),
        eq(analyticsSnapshotsTable.domain, domain),
      ),
    );

  if (existing.length > 0) {
    return { snapshotKey, snapshotId: existing[0].id };
  }

  const [scores, risks, attendanceAggs] = await Promise.all([
    db
      .select()
      .from(studentScoresTable)
      .where(
        and(
          eq(studentScoresTable.studentId, studentId),
          eq(studentScoresTable.domain, "attendance_analytics"),
          eq(studentScoresTable.scorePeriod, aggregatePeriod),
        ),
      ),
    db
      .select()
      .from(studentRiskProfilesTable)
      .where(
        and(
          eq(studentRiskProfilesTable.studentId, studentId),
          eq(studentRiskProfilesTable.riskPeriod, aggregatePeriod),
        ),
      ),
    db
      .select()
      .from(attendanceAggregatesTable)
      .where(
        and(
          eq(attendanceAggregatesTable.studentId, studentId),
          eq(attendanceAggregatesTable.aggregatePeriod, aggregatePeriod),
        ),
      ),
  ]);

  const snapshotPayload = snapshotDataSchema.parse({
    computedAt: new Date().toISOString(),
    sources: {
      studentScores: scores,
      studentRiskProfiles: risks,
      attendanceAggregates: attendanceAggs,
    },
    metrics: {
      overallAttendanceScore: scores[0]?.scoreValue ?? null,
      riskLevel: risks[0]?.riskLevel ?? null,
    },
  });

  const checksum = computeJsonChecksum(snapshotPayload);

  const inserted = await db
    .insert(analyticsSnapshotsTable)
    .values({
      domain,
      tenantId,
      studentId,
      classId: classId ?? null,
      section: section ?? null,
      snapshotPeriod,
      snapshotKey,
      generatedAt: new Date(),
      data: snapshotPayload,
      checksum,
      isFinal: true,
    })
    .returning({ id: analyticsSnapshotsTable.id });

  return { snapshotKey, snapshotId: inserted[0].id };
}

// Future extension point: academic/fee/engagement snapshot generators.
export async function generateAnyAttendanceSnapshot() {
  throw new Error(
    "NOT_IMPLEMENTED: Use generateAttendanceSnapshot for attendance domain.",
  );
}

// Keep AI table import referenced to ensure tree-shaking determinism (no-op).
void aiGeneratedSummariesTable;

