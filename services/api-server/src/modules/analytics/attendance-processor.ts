import { and, asc, eq, sql } from "drizzle-orm";
import { analyticsEventsTable, attendanceAggregatesTable, studentRiskProfilesTable, studentScoresTable, db, attendanceTable } from "@toppers/db";

import { attendanceMarkedEventSchema } from "@toppers/validations";

/**
 * attendance_analytics processor (v0)
 *
 * Systems-first: domain logic is isolated from controllers.
 * This processor is deterministic, validation-first, and persists aggregates.
 */

const FAILURE_DOMAIN = "attendance_analytics" as const;

function normalizeDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizePeriodMonth(date: Date) {
  return normalizeDate(date).slice(0, 7); // YYYY-MM
}

function computeAttendanceScore(attendancePercentage: number) {
  // 0..100 score (rule-based)
  return Math.max(0, Math.min(100, Math.round(attendancePercentage)));
}

function computeAttendanceRisk(attendancePercentage: number, currentStreak: number) {
  // very simple risk rules for foundation; extensible to multi-component scoring later
  const attendanceRisk = attendancePercentage < 70 ? 60 : attendancePercentage < 85 ? 30 : 5;
  const streakRisk = currentStreak >= 3 ? 25 : 0;
  const overallRiskScore = Math.min(100, attendanceRisk + streakRisk);
  const riskLevel = overallRiskScore >= 70 ? "high" : overallRiskScore >= 35 ? "medium" : "low";

  return {
    overallRiskScore,
    riskLevel,
    components: {
      attendancePercentage,
      currentStreak,
      attendanceRisk,
      streakRisk,
    } satisfies Record<string, unknown>,
  };
}

export type AttendanceProcessorResult = {
  processedEvents: number;
  domains: string[];
};

export async function processAttendanceAnalyticsEvents(options: {
  batchSize?: number;
} = {}): Promise<AttendanceProcessorResult> {
  const batchSize = options.batchSize ?? 50;

  // Fetch queued/unprocessed events deterministically.
  // We use analytics_events as the foundation for replayability + restart-safety.
  const events = await db
    .select({ id: analyticsEventsTable.id, eventType: analyticsEventsTable.eventType, payload: analyticsEventsTable.payload, eventIdempotencyKey: analyticsEventsTable.eventIdempotencyKey, actorId: analyticsEventsTable.actorId, occurredAt: analyticsEventsTable.occurredAt })
    .from(analyticsEventsTable)
    .where(
      and(
        eq(analyticsEventsTable.processingStatus, "queued"),
        eq(analyticsEventsTable.eventType, "ATTENDANCE_MARKED"),
      ),
    )
    .orderBy(asc(analyticsEventsTable.occurredAt))
    .limit(batchSize);

  if (events.length === 0) {
    return { processedEvents: 0, domains: [FAILURE_DOMAIN] };
  }

  let processedEvents = 0;

  for (const evt of events) {
    try {
      const parsed = attendanceMarkedEventSchema.parse(evt.payload);

      const { studentId, attendanceDate, status, classId, section } = parsed.payload;

      // Load all attendance rows for student within the month of attendanceDate to compute aggregate.
      const dateObj = new Date(attendanceDate);
      const month = normalizePeriodMonth(dateObj);

      const monthStart = `${month}-01`;
      const monthEnd = `${month}-31`;

      const attendanceRows = await db
        .select({ date: attendanceTable.date, status: attendanceTable.status })
        .from(attendanceTable)
        .where(
          and(
            eq(attendanceTable.studentId, studentId),
            sql`DATE(${attendanceTable.date}) >= ${monthStart}::date`,
            sql`DATE(${attendanceTable.date}) <= ${monthEnd}::date`,
          ),
        )
        .orderBy(asc(attendanceTable.date));

      if (attendanceRows.length === 0) {
        // Still persist an empty aggregate for auditability.
        await db
          .insert(attendanceAggregatesTable)
          .values({
            studentId,
            classId,
            section: section ?? null,
            aggregatePeriod: month,
            presentDays: 0,
            absentDays: 0,
            attendancePercentage: 0,
            trend: {
              recomputedFrom: "ATTENDANCE_MARKED",
              lastEventStatus: status,
            },
            algorithm: "rule_based_v1",
            // createdAt/updatedAt auto
          })
          .onConflictDoUpdate({
            target: [attendanceAggregatesTable.studentId, attendanceAggregatesTable.aggregatePeriod],
            set: {
              presentDays: 0,
              absentDays: 0,
              attendancePercentage: 0,
              classId,
              section: section ?? null,
              trend: {
                recomputedFrom: "ATTENDANCE_MARKED",
                lastEventStatus: status,
              },
              algorithm: "rule_based_v1",
            },
          });
      } else {
        let presentDays = 0;
        let absentDays = 0;
        for (const r of attendanceRows) {
          if (r.status === "present") presentDays += 1;
          else if (r.status === "absent") absentDays += 1;
        }
        const totalDays = attendanceRows.length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // Current streak: contiguous present from latest date within the dataset.
        let currentStreak = 0;
        for (let i = attendanceRows.length - 1; i >= 0; i -= 1) {
          if (attendanceRows[i].status === "present") currentStreak += 1;
          else break;
        }

        const scoreValue = computeAttendanceScore(attendancePercentage);
        const risk = computeAttendanceRisk(attendancePercentage, currentStreak);

        await db.transaction(async (tx) => {
          await tx
            .insert(attendanceAggregatesTable)
            .values({
              studentId,
              classId,
              section: section ?? null,
              aggregatePeriod: month,
              presentDays,
              absentDays,
              attendancePercentage,
              trend: {
                recomputedFrom: "ATTENDANCE_MARKED",
                lastEventStatus: status,
              },
              algorithm: "rule_based_v1",
            })
            .onConflictDoUpdate({
              target: [attendanceAggregatesTable.studentId, attendanceAggregatesTable.aggregatePeriod],
              set: {
                presentDays,
                absentDays,
                attendancePercentage,
                classId,
                section: section ?? null,
                trend: {
                  recomputedFrom: "ATTENDANCE_MARKED",
                  lastEventStatus: status,
                },
                updatedAt: new Date(),
                algorithm: "rule_based_v1",
              },
            });

          await tx
            .insert(studentScoresTable)
            .values({
              studentId,
              domain: "attendance_analytics",
              scorePeriod: month,
              scoreValue,
              maxScore: 100,
              breakdown: {
                attendancePercentage,
                presentDays,
                absentDays,
                currentStreak,
              },
              algorithm: "rule_based_v1",
            })
            .onConflictDoUpdate({
              target: [studentScoresTable.studentId, studentScoresTable.domain, studentScoresTable.scorePeriod],
              set: {
                scoreValue,
                breakdown: {
                  attendancePercentage,
                  presentDays,
                  absentDays,
                  currentStreak,
                },
                updatedAt: new Date(),
                maxScore: 100,
                algorithm: "rule_based_v1",
              },
            });

          await tx
            .insert(studentRiskProfilesTable)
            .values({
              studentId,
              riskPeriod: month,
              overallRiskScore: risk.overallRiskScore,
              riskLevel: risk.riskLevel,
              components: risk.components,
              algorithm: "rule_based_v1",
            })
            .onConflictDoUpdate({
              target: [studentRiskProfilesTable.studentId, studentRiskProfilesTable.riskPeriod],
              set: {
                overallRiskScore: risk.overallRiskScore,
                riskLevel: risk.riskLevel,
                components: risk.components,
                updatedAt: new Date(),
                algorithm: "rule_based_v1",
              },
            });
        });
      }

      // mark event processed
      await db
        .update(analyticsEventsTable)
        .set({
          processingStatus: "processed",
          processedAt: new Date(),
        })
        .where(eq(analyticsEventsTable.id, evt.id));

      processedEvents += 1;
    } catch {
      // keep restart safety: mark failed but do not lose event
      await db
        .update(analyticsEventsTable)
        .set({ processingStatus: "failed" })
        .where(eq(analyticsEventsTable.id, evt.id));
    }
  }

  return { processedEvents, domains: [FAILURE_DOMAIN] };
}
