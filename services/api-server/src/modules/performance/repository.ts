import { desc, eq } from "drizzle-orm";
import { db, performanceNotesTable } from "@toppers/db";
import type { PerformanceNoteResponse } from "./types";

export const performanceRepository = {
  async createPerformanceNote(authorId: string, input: {
    studentId: string;
    note: string;
    strengths: string;
    weaknesses: string;
    recommendations: string;
    behavioralNotes: string;
  }): Promise<PerformanceNoteResponse> {
    const [note] = await db
      .insert(performanceNotesTable)
      .values({
        studentId: input.studentId,
        authorId,
        note: input.note,
        strengths: input.strengths,
        weaknesses: input.weaknesses,
        recommendations: input.recommendations,
        behavioralNotes: input.behavioralNotes,
      })
      .returning({
        id: performanceNotesTable.id,
        studentId: performanceNotesTable.studentId,
        authorId: performanceNotesTable.authorId,
        note: performanceNotesTable.note,
        strengths: performanceNotesTable.strengths,
        weaknesses: performanceNotesTable.weaknesses,
        recommendations: performanceNotesTable.recommendations,
        behavioralNotes: performanceNotesTable.behavioralNotes,
        createdAt: performanceNotesTable.createdAt,
      });

    return {
      ...note,
      createdAt: note.createdAt.toISOString(),
    };
  },

  async findPerformanceNotesForStudent(studentId: string) {
    return db.query.performanceNotesTable.findMany({
      where: eq(performanceNotesTable.studentId, studentId),
      orderBy: desc(performanceNotesTable.createdAt),
    });
  },
};
