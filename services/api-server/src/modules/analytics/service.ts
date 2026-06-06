import { and, desc, eq, inArray, sql, count } from "drizzle-orm";
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
  usersTable,
  userRolesTable,
  rolesTable,
  parentsTable,
  studentParentsTable,
  feeRecordsTable,
  feeStatusTable,
  performanceNotesTable,
} from "@toppers/db";

import type { ClassAttendanceSummary, StudentAttendanceAnalytics, DashboardAnalyticsSummary } from "./types";

export const analyticsService = {
  /**
   * Dashboard Summary - Comprehensive analytics overview
   * Returns total counts, attendance, fees, performance across all students
   */
  async getDashboardSummary(auth: AuthenticatedPrincipal): Promise<DashboardAnalyticsSummary> {
    if (
      auth.roles.includes(ROLE_NAMES.PARENT) ||
      auth.roles.includes(ROLE_NAMES.STUDENT)
    ) {
      throw new HttpError(
        403,
        "ANALYTICS_FORBIDDEN",
        "Only teachers and administrators may access analytics",
      );
    }

    // Total active students
    const [studentCount] = await db
      .select({ count: count() })
      .from(studentsTable)
      .where(
        and(
          eq(studentsTable.isArchived, false),
          eq(studentsTable.status, "active"),
        ),
      );

    // Total teachers
    const [teacherCount] = await db
      .select({ count: count() })
      .from(userRolesTable)
      .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
      .innerJoin(usersTable, eq(userRolesTable.userId, usersTable.id))
      .where(
        and(
          eq(rolesTable.name, "TEACHER"),
          eq(usersTable.status, "active"),
        ),
      );

    // Total parents
    const [parentCount] = await db
      .select({ count: count() })
      .from(parentsTable);

    // Total parent-student links
    const [parentLinkCount] = await db
      .select({ count: count() })
      .from(studentParentsTable);

    // Unique classes
    const classesResult = await db
      .select({ class: studentsTable.class })
      .from(studentsTable)
      .where(eq(studentsTable.isArchived, false))
      .groupBy(studentsTable.class);

    const activeClasses = classesResult.map(r => r.class);

    // Overall attendance average
    const attendanceSummaries = await db
      .select({
        attendancePercentage: attendanceSummaryTable.attendancePercentage,
      })
      .from(attendanceSummaryTable);

    const overallAttendanceAvg =
      attendanceSummaries.length > 0
        ? Math.round(
            attendanceSummaries.reduce((sum, r) => sum + r.attendancePercentage, 0) /
              attendanceSummaries.length,
          )
        : 0;

    // Students below 75% attendance
    const lowAttendanceCount = attendanceSummaries.filter(
      r => r.attendancePercentage < 75,
    ).length;

    // Fee collection summary
    const feeStats = await db
      .select({
        totalDue: sql<number>`COALESCE(SUM(${feeRecordsTable.amountDue}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${feeRecordsTable.amountPaid}), 0)`,
      })
      .from(feeRecordsTable);

    // Pending fees count
    const [pendingFeeResult] = await db
      .select({ count: count() })
      .from(feeRecordsTable)
      .where(eq(feeRecordsTable.status, "pending"));

    // Overdue fees
    const today = new Date().toISOString().split('T')[0];
    const [overdueFeeResult] = await db
      .select({ count: count() })
      .from(feeRecordsTable)
      .where(
        and(
          eq(feeRecordsTable.status, "pending"),
          sql`${feeRecordsTable.dueDate} < ${today}::date`,
        ),
      );

    // Recent performance notes count (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentNotesResult] = await db
      .select({ count: count() })
      .from(performanceNotesTable)
      .where(
        sql`${performanceNotesTable.createdAt} > ${thirtyDaysAgo.toISOString()}::timestamp`,
      );

    // Today's attendance
    const todayAttendance = await db
      .select({ status: attendanceTable.status })
      .from(attendanceTable)
      .where(eq(attendanceTable.date, today));

    const todayPresent = todayAttendance.filter(r => r.status === "present").length;
    const todayAbsent = todayAttendance.filter(r => r.status === "absent").length;

    // Class distribution
    const classDistribution = await db
      .select({
        className: studentsTable.class,
        studentCount: count(),
      })
      .from(studentsTable)
      .where(eq(studentsTable.isArchived, false))
      .groupBy(studentsTable.class)
      .orderBy(studentsTable.class);

    return {
      timestamp: new Date().toISOString(),
      studentStats: {
        totalStudents: Number(studentCount?.count ?? 0),
        activeClasses,
        classCount: activeClasses.length,
      },
      staffStats: {
        totalTeachers: Number(teacherCount?.count ?? 0),
        totalParents: Number(parentCount?.count ?? 0),
        parentLinks: Number(parentLinkCount?.count ?? 0),
      },
      attendanceStats: {
        overallAverage: overallAttendanceAvg,
        lowAttendanceCount,
        todayPresent,
        todayAbsent,
      },
      feeStats: {
        totalDue: Number(feeStats[0]?.totalDue ?? 0),
        totalCollected: Number(feeStats[0]?.totalPaid ?? 0),
        pendingFees: Number(pendingFeeResult?.count ?? 0),
        overdueFees: Number(overdueFeeResult?.count ?? 0),
        collectionRate:
          feeStats[0] && feeStats[0].totalDue > 0
            ? Math.round(
                (Number(feeStats[0].totalPaid) / Number(feeStats[0].totalDue)) * 100,
              )
            : 0,
      },
      performanceStats: {
        recentNotes: Number(recentNotesResult?.count ?? 0),
      },
      classDistribution: classDistribution.map(c => ({
        className: c.className,
        studentCount: Number(c.studentCount),
      })),
    };
  },

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
        aggregatePeriod: attendanceAggregatesTable.aggregatePeriod,
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