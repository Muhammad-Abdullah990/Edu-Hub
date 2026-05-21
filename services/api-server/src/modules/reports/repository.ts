import { and, desc, eq } from "drizzle-orm";
import { db, progressReportsTable } from "@toppers/db";

export const reportsRepository = {
  async createReport(input: {
    studentId: string;
    month: string;
    teacherNote: string;
    strengths: string[];
    weaknesses: string[];
    academicProgress: Record<string, unknown>;
    status: string;
  }) {
    const [row] = await db
      .insert(progressReportsTable)
      .values(input)
      .returning({
        id: progressReportsTable.id,
        studentId: progressReportsTable.studentId,
        month: progressReportsTable.month,
        teacherNote: progressReportsTable.teacherNote,
        strengths: progressReportsTable.strengths,
        weaknesses: progressReportsTable.weaknesses,
        academicProgress: progressReportsTable.academicProgress,
        status: progressReportsTable.status,
        generatedPdfPath: progressReportsTable.generatedPdfPath,
        errorMessage: progressReportsTable.errorMessage,
        createdAt: progressReportsTable.createdAt,
        updatedAt: progressReportsTable.updatedAt,
      });

    return row;
  },

  async findReportByStudentMonth(studentId: string, month: string) {
    return db.query.progressReportsTable.findFirst({
      where: and(
        eq(progressReportsTable.studentId, studentId),
        eq(progressReportsTable.month, month),
      ),
    });
  },

  async findReportsByStudentId(studentId: string) {
    return db.query.progressReportsTable.findMany({
      where: eq(progressReportsTable.studentId, studentId),
      orderBy: desc(progressReportsTable.createdAt),
    });
  },

  async findReportById(reportId: string) {
    return db.query.progressReportsTable.findFirst({
      where: eq(progressReportsTable.id, reportId),
    });
  },

  async updateReport(reportId: string, updates: Partial<{
    status: string;
    generatedPdfPath: string | null;
    errorMessage: string | null;
  }>) {
    await db
      .update(progressReportsTable)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(progressReportsTable.id, reportId));
  },
};
