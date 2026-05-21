import { db, studentsTable } from "@toppers/db";
import { eq } from "drizzle-orm";

export async function archiveStudent(studentId: string): Promise<void> {
  await db
    .update(studentsTable)
    .set({
      status: "archived",
      isArchived: true,
      archivedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(studentsTable.id, studentId));
}
