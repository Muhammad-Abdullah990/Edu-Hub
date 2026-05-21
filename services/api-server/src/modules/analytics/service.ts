import { and, desc, eq, inArray } from "drizzle-orm";
import { ROLE_NAMES } from "@toppers/auth";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import { HttpError } from "../../lib/http-error";
import {
  attendanceAggregatesTable,
  attendanceTable,
  attendanceSummaryTable,
  db,
  studentsTable,
  studentScoresTable,
} from "@toppers/db";

import type { ClassAttendanceSummary, StudentAttendanceAnalytics } from "./types";

export const analyticsService = {
  async getStudentAttendanceAnalytics(
    auth: AuthenticatedPrincipal,
    studentId: string,
  ): Promise<StudentAttendanceAnalytics> {
    if (
      auth.roles.includes(ROLE_NAMES.PARENT) ||
      auth.roles.includes(ROLE_NAMES.STUDENT)
    ) {
      throw new HttpError(
        403,
        "ANALYTICS_FORBIDDEN",
        "Only teachers and administrators may access student attendance analytics",
      );
    }

    const aggregates = await db
      .select({
        aggregatePeriod: attendanceAggregatesTable.aggregatePeriod, // YYYY-MM
        presentDays: attendanceAggregatesTable.presentDays,
        absentDays: attendanceAggregatesTable.absentDays,
        attendancePercentage: attendanceAggregatesTable.attendancePercentage,
      })
      .from(attendanceAggregatesTable)
      .where(eq(attendanceAggregatesTable.studentId, studentId))
      .orderBy(desc(attendanceAggregatesTable.aggregatePeriod));

    if (aggregates.length === 0) {
      return {
        studentId,
        overallPercentage: 0,
        currentStreak: 0,
        warning: false,
        absentPattern: [],
        monthlyAttendance: [],
      };
    }

    // monthlyAttendance sorted ascending by period for UX consistency
    const monthlyAttendance = aggregates
      .slice()
      .reverse()
      .map((row) => ({
        period: row.aggregatePeriod,
        presentDays: row.presentDays,
        totalDays: row.presentDays + row.absentDays,
        percentage: row.attendancePercentage,
      }));

    const totals = aggregates.reduce(
      (acc, row) => {
        acc.present += row.presentDays;
        acc.absent += row.absentDays;
        return acc;
      },
      { present: 0, absent: 0 },
    );

    const totalDays = totals.present + totals.absent;
    const overallPercentage =
      totalDays > 0 ? Math.round((totals.present / totalDays) * 100) : 0;

    // currentStreak is derived from latest persisted score breakdown
    const latestScore = await db
      .select({ breakdown: studentScoresTable.breakdown })
      .from(studentScoresTable)
      .where(
        and(
          eq(studentScoresTable.studentId, studentId),
          eq(studentScoresTable.domain, "attendance_analytics"),
        ),
      )
      .orderBy(desc(studentScoresTable.scorePeriod))
      .limit(1);

    const breakdown = latestScore[0]?.breakdown as
      | { currentStreak?: number }
      | undefined;

    return {
      studentId,
      overallPercentage,
      currentStreak: breakdown?.currentStreak ?? 0,
      warning: overallPercentage < 70,
      // absentPattern is not yet persisted in v0 aggregates; keep empty for correctness.
      absentPattern: [],
      monthlyAttendance,
    };
  },

  async getClassAttendanceSummary(
    auth: AuthenticatedPrincipal,
    classId: string,
    date: string,
    section?: string,
  ): Promise<ClassAttendanceSummary> {
    if (
      auth.roles.includes(ROLE_NAMES.PARENT) ||
      auth.roles.includes(ROLE_NAMES.STUDENT)
    ) {
      throw new HttpError(
        403,
        "ANALYTICS_FORBIDDEN",
        "Only teachers and administrators may access class analytics",
      );
    }

    const studentConditions = [
      eq(studentsTable.class, classId),
      eq(studentsTable.isArchived, false),
    ];
    if (section) {
      studentConditions.push(eq(studentsTable.section, section));
    }

    const studentRows = await db
      .select({ id: studentsTable.id })
      .from(studentsTable)
      .where(and(...studentConditions));

    const studentIds = studentRows.map((s) => s.id);
    const totalStudents = studentIds.length;

    // For class-day counts, keep consistent with existing UX using raw attendance for that single date.
    // This is not a heavy computation (bounded by a single date + studentIds).
    const attendanceRows =
      totalStudents === 0
        ? []
        : await db
            .select({ status: attendanceTable.status })
            .from(attendanceTable)
            .where(
              and(
                eq(attendanceTable.date, date),
                inArray(attendanceTable.studentId, studentIds),
              ),
            );

    const presentCount = attendanceRows.filter(
      (r) => r.status === "present",
    ).length;
    const absentCount = attendanceRows.filter(
      (r) => r.status === "absent",
    ).length;

    // Class average from persisted attendance summaries for auditability.
    const summaries =
      totalStudents === 0
        ? []
        : await db
            .select({
              studentId: attendanceSummaryTable.studentId,
              attendancePercentage: attendanceSummaryTable.attendancePercentage,
            })
            .from(attendanceSummaryTable)
            .where(inArray(attendanceSummaryTable.studentId, studentIds));

    const classAveragePercentage =
      summaries.length > 0
        ? Math.round(
            summaries.reduce(
              (sum, row) => sum + row.attendancePercentage,
              0,
            ) / summaries.length,
          )
        : 0;

    const warningCount = summaries.filter(
      (r) => r.attendancePercentage < 70,
    ).length;

    return {
      classId,
      section: section ?? null,
      date,
      totalStudents,
      presentCount,
      absentCount,
      classAveragePercentage,
      warningCount,
    };
  },
};

