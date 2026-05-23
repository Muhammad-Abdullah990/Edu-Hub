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
  db,
  feeStatusTable,
  performanceNotesTable,
  studentsTable,
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

  async deleteStudent(studentId: string) {
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
