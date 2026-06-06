import {
  and,
  asc,
  desc,
  eq,
  inArray,
  like,
  or,
  sql,
} from "drizzle-orm";
import {
  attendanceSummaryTable,
  attendanceTable,
  communicationQueueTable,
  db,
  feeRecordsTable,
  feeRemindersTable,
  feeStatusTable,
  notificationHistoryTable,
  parentsTable,
  performanceNotesTable,
  progressReportsTable,
  sessionsTable,
  studentParentsTable,
  studentsTable,
  userRolesTable,
  usersTable,
} from "@toppers/db";

export type StudentListFilter = {
  q?: string;
  class?: string;
  status?: "active" | "archived";
  page: number;
  limit: number;
  sortBy: "fullName" | "admissionDate" | "class" | "studentCode";
  sortOrder: "asc" | "desc";
};

export const studentsRepository = {
  async countStudents(): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(studentsTable);
    return Number(result[0]?.count ?? 0);
  },

  async findStudentByCode(studentCode: string) {
    return db.query.studentsTable.findFirst({
      where: eq(studentsTable.studentCode, studentCode),
    });
  },

  async createStudent(input: {
    studentCode: string;
    fullName: string;
    class: string;
    section: string;
    dateOfBirth: string;
    admissionDate: string;
    photoUrl: string;
    status: "active" | "archived";
    monthlyFeeAmount?: number;
    feeCycleStartDate?: string | null;
    nextFeeDueDate?: string | null;
    portalUserId?: string | null;
  }) {
    const [student] = await db
      .insert(studentsTable)
      .values({
        studentCode: input.studentCode,
        fullName: input.fullName,
        class: input.class,
        section: input.section,
        dateOfBirth: input.dateOfBirth,
        admissionDate: input.admissionDate,
        photoUrl: input.photoUrl,
        status: input.status,
        monthlyFeeAmount: input.monthlyFeeAmount ?? 0,
        feeCycleStartDate: input.feeCycleStartDate ?? null,
        nextFeeDueDate: input.nextFeeDueDate ?? null,
        portalUserId: input.portalUserId ?? null,
      })
      .returning({ id: studentsTable.id });

    return student;
  },

  async updateStudent(
    studentId: string,
    updates: Partial<{
      studentCode: string;
      fullName: string;
      class: string;
      section: string;
      dateOfBirth: string;
      admissionDate: string;
      photoUrl: string;
      status: "active" | "archived";
      monthlyFeeAmount: number;
      feeCycleStartDate: string | null;
      nextFeeDueDate: string | null;
    }>,
  ) {
    await db
      .update(studentsTable)
      .set({
        ...(updates.studentCode ? { studentCode: updates.studentCode } : {}),
        ...(updates.fullName ? { fullName: updates.fullName } : {}),
        ...(updates.class ? { class: updates.class } : {}),
        ...(updates.section ? { section: updates.section } : {}),
        ...(updates.dateOfBirth ? { dateOfBirth: updates.dateOfBirth } : {}),
        ...(updates.admissionDate ? { admissionDate: updates.admissionDate } : {}),
        ...(updates.photoUrl ? { photoUrl: updates.photoUrl } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        ...(updates.monthlyFeeAmount !== undefined ? { monthlyFeeAmount: updates.monthlyFeeAmount } : {}),
        ...(updates.feeCycleStartDate !== undefined ? { feeCycleStartDate: updates.feeCycleStartDate } : {}),
        ...(updates.nextFeeDueDate !== undefined ? { nextFeeDueDate: updates.nextFeeDueDate } : {}),
        ...(updates.status === "archived"
          ? { isArchived: true, archivedAt: new Date() }
          : {}),
        updatedAt: new Date(),
      })
      .where(eq(studentsTable.id, studentId));
  },

  async archiveStudent(studentId: string) {
    await db
      .update(studentsTable)
      .set({
        status: "archived",
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(studentsTable.id, studentId));
  },

  async restoreStudent(studentId: string) {
    await db
      .update(studentsTable)
      .set({
        status: "active",
        isArchived: false,
        archivedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(studentsTable.id, studentId));
  },

  /**
   * ❌ FULLY DELETES a student and ALL related data across the system:
   * - Student portal user (sessions, user_roles, user itself)
   * - Attendance records & attendance summary
   * - Fee records, fee reminders, fee status
   * - Performance notes, progress reports
   * - Communication queue & notification history
   * - Student-parent links
   * - The student record itself
   */
  async deleteStudent(studentId: string) {
    // 1. Get the student first to find linked portal user
    const student = await db.query.studentsTable.findFirst({
      where: eq(studentsTable.id, studentId),
    });
    if (!student) return;

    // 2. Delete the portal user account if linked — this cascades to sessions & user_roles automatically
    if (student.portalUserId) {
      await db.delete(sessionsTable).where(eq(sessionsTable.userId, student.portalUserId));
      await db.delete(userRolesTable).where(eq(userRolesTable.userId, student.portalUserId));
      await db.delete(usersTable).where(eq(usersTable.id, student.portalUserId));
    }

    // 3. Delete attendance records (manual cascade — some fkeys may not cascade)
    await db.delete(attendanceTable).where(eq(attendanceTable.studentId, studentId));
    await db.delete(attendanceSummaryTable).where(eq(attendanceSummaryTable.studentId, studentId));

    // 4. Delete fee-related data
    await db.delete(feeStatusTable).where(eq(feeStatusTable.studentId, studentId));
    // Delete fee reminders before fee records (fk constraint)
    await db.delete(feeRemindersTable).where(eq(feeRemindersTable.studentId, studentId));
    await db.delete(feeRecordsTable).where(eq(feeRecordsTable.studentId, studentId));

    // 5. Delete performance notes & progress reports
    await db.delete(performanceNotesTable).where(eq(performanceNotesTable.studentId, studentId));
    await db.delete(progressReportsTable).where(eq(progressReportsTable.studentId, studentId));

    // 6. Delete communication queue & notification history
    // Get all queue items first to find linked notification history
    const queueItems = await db
      .select({ id: communicationQueueTable.id })
      .from(communicationQueueTable)
      .where(eq(communicationQueueTable.studentId, studentId));
    const queueItemIds = queueItems.map((q) => q.id);
    if (queueItemIds.length > 0) {
      await db.delete(notificationHistoryTable).where(
        inArray(notificationHistoryTable.queueItemId, queueItemIds),
      );
    }
    await db.delete(communicationQueueTable).where(
      eq(communicationQueueTable.studentId, studentId),
    );

    // 7. Delete student-parent links
    await db.delete(studentParentsTable).where(
      eq(studentParentsTable.studentId, studentId),
    );

    // 8. Finally delete the student record
    await db.delete(studentsTable).where(eq(studentsTable.id, studentId));
  },

  async findStudentByPortalUserId(portalUserId: string) {
    return db.query.studentsTable.findFirst({
      where: eq(studentsTable.portalUserId, portalUserId),
      with: {
        attendanceSummary: true,
        feeStatus: true,
        studentParents: {
          with: {
            parent: true,
          },
        },
      },
    });
  },

  async linkPortalUser(studentId: string, portalUserId: string | null) {
    await db
      .update(studentsTable)
      .set({ portalUserId, updatedAt: new Date() })
      .where(eq(studentsTable.id, studentId));
  },

  async findStudentById(studentId: string) {
    return db.query.studentsTable.findFirst({
      where: eq(studentsTable.id, studentId),
      with: {
        attendanceSummary: true,
        feeStatus: true,
        studentParents: {
          with: {
            parent: true,
          },
        },
      },
    });
  },

  async findStudents(filter: StudentListFilter) {
    const conditions = [] as unknown[];

    if (filter.status === "archived") {
      conditions.push(eq(studentsTable.status, "archived"));
    } else {
      conditions.push(eq(studentsTable.status, "active"));
      conditions.push(eq(studentsTable.isArchived, false));
    }

    if (filter.class) {
      conditions.push(eq(studentsTable.class, filter.class));
    }

    if (filter.q) {
      const wildcard = `%${filter.q}%`;
      conditions.push(
        and(
          or(
            like(studentsTable.fullName, wildcard),
            like(studentsTable.studentCode, wildcard),
          ),
        ),
      );
    }

    const sortColumn = {
      admissionDate: studentsTable.admissionDate,
      class: studentsTable.class,
      studentCode: studentsTable.studentCode,
      fullName: studentsTable.fullName,
    }[filter.sortBy];

    const students = await db
      .select({
        id: studentsTable.id,
        studentCode: studentsTable.studentCode,
        fullName: studentsTable.fullName,
        class: studentsTable.class,
        section: studentsTable.section,
        status: studentsTable.status,
        photoUrl: studentsTable.photoUrl,
        portalUserId: studentsTable.portalUserId,
        admissionDate: studentsTable.admissionDate,
        attendancePercentage: attendanceSummaryTable.attendancePercentage,
        feeStatus: feeStatusTable.status,
      })
      .from(studentsTable)
      .leftJoin(
        attendanceSummaryTable,
        eq(attendanceSummaryTable.studentId, studentsTable.id),
      )
      .leftJoin(feeStatusTable, eq(feeStatusTable.studentId, studentsTable.id))
      .where(conditions.length > 0 ? and(...(conditions as any)) : undefined)
      .orderBy(
        filter.sortOrder === "asc"
          ? asc(sortColumn)
          : desc(sortColumn),
      )
      .limit(filter.limit)
      .offset((filter.page - 1) * filter.limit);

    const countResult = await db
      .select({ total: sql`count(*)` })
      .from(studentsTable)
      .where(conditions.length > 0 ? and(...(conditions as any)) : undefined);

    return {
      students,
      total: Number(countResult[0]?.total ?? students.length),
    };
  },

  async findLatestPerformanceNotesForStudentIds(studentIds: string[]) {
    if (studentIds.length === 0) {
      return [] as Array<{
        id: string;
        studentId: string;
        note: string;
        createdAt: Date;
        authorId: string | null;
      }>;
    }

    return db.query.performanceNotesTable.findMany({
      where: inArray(performanceNotesTable.studentId, studentIds),
      orderBy: desc(performanceNotesTable.createdAt),
    });
  },

  async findPerformanceNotesForStudent(studentId: string) {
    return db.query.performanceNotesTable.findMany({
      where: eq(performanceNotesTable.studentId, studentId),
      orderBy: desc(performanceNotesTable.createdAt),
      with: {
        author: true,
      },
    });
  },
};