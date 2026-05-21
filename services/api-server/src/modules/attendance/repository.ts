import { and, asc, eq, inArray } from "drizzle-orm";
import {
  attendanceSummaryTable,
  attendanceTable,
  db,
  studentsTable,
} from "@toppers/db";
import type { AttendanceBulkResult, AttendanceRecord } from "./types";

export const attendanceRepository = {
  async findAttendanceByClassDate(
    classId: string,
    date: string,
    section?: string,
  ) {
    const conditions = [
      eq(studentsTable.class, classId),
      eq(studentsTable.isArchived, false),
    ];

    if (section) {
      conditions.push(eq(studentsTable.section, section));
    }

    return db
      .select({
        studentId: studentsTable.id,
        studentCode: studentsTable.studentCode,
        fullName: studentsTable.fullName,
        class: studentsTable.class,
        section: studentsTable.section,
        status: attendanceTable.status,
        attendanceDate: attendanceTable.date,
        markedBy: attendanceTable.markedBy,
      })
      .from(studentsTable)
      .leftJoin(
        attendanceTable,
        and(
          eq(attendanceTable.studentId, studentsTable.id),
          eq(attendanceTable.date, date),
        ),
      )
      .where(and(...conditions))
      .orderBy(asc(studentsTable.fullName));
  },

  async markAttendanceBulk(authorId: string, input: {
    class: string;
    section?: string;
    date: string;
    items: Array<{ studentId: string; status: "present" | "absent" }>;
  }): Promise<AttendanceBulkResult> {
    const studentIds = input.items.map((item) => item.studentId);
    if (studentIds.length === 0) {
      return { updated: 0 };
    }

    return db.transaction(async (tx) => {
      await tx
        .delete(attendanceTable)
        .where(
          and(
            eq(attendanceTable.date, input.date),
            inArray(attendanceTable.studentId, studentIds),
          ),
        );

      const attendanceRows = input.items.map((item) => ({
        studentId: item.studentId,
        date: input.date,
        status: item.status,
        markedBy: authorId,
      }));

      await tx.insert(attendanceTable).values(attendanceRows);

      const attendanceHistory = await tx
        .select({
          studentId: attendanceTable.studentId,
          status: attendanceTable.status,
        })
        .from(attendanceTable)
        .where(inArray(attendanceTable.studentId, studentIds));

      const summaryByStudent = new Map(
        attendanceHistory.map((row) => [row.studentId, { present: 0, absent: 0, total: 0 }]),
      );

      attendanceHistory.forEach((row) => {
        const summary = summaryByStudent.get(row.studentId);
        if (!summary) {
          return;
        }
        summary.total += 1;
        if (row.status === "present") {
          summary.present += 1;
        } else if (row.status === "absent") {
          summary.absent += 1;
        }
      });

      await Promise.all(
        Array.from(summaryByStudent.entries()).map(([studentId, summary]) =>
          tx
            .insert(attendanceSummaryTable)
            .values({
              studentId,
              attendancePercentage:
                summary.total > 0
                  ? Math.round((summary.present / summary.total) * 100)
                  : 0,
              totalDays: summary.total,
              presentDays: summary.present,
              absentDays: summary.absent,
              lastRecordedAt: new Date(),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: attendanceSummaryTable.studentId,
              set: {
                attendancePercentage:
                  summary.total > 0
                    ? Math.round((summary.present / summary.total) * 100)
                    : 0,
                totalDays: summary.total,
                presentDays: summary.present,
                absentDays: summary.absent,
                lastRecordedAt: new Date(),
                updatedAt: new Date(),
              },
            }),
        ),
      );

      return { updated: attendanceRows.length };
    });
  },

  async findAttendanceForStudent(studentId: string) {
    return db.query.attendanceTable.findMany({
      where: eq(attendanceTable.studentId, studentId),
      orderBy: asc(attendanceTable.date),
    });
  },
};
