import { and, eq } from "drizzle-orm";
import {
  db,
  parentsTable,
  studentParentsTable,
  studentsTable,
} from "@toppers/db";
import type { ParentCreateInput } from "./types";

export const parentsRepository = {
  async createParent(parent: ParentCreateInput) {
    const [row] = await db
      .insert(parentsTable)
      .values({
        name: parent.name,
        phone: parent.phone,
        email: parent.email,
        relationship: parent.relationship,
        address: parent.address,
        userId: parent.userId,
        whatsappNumbers: parent.whatsappNumbers ?? [],
      })
      .returning({
        id: parentsTable.id,
        userId: parentsTable.userId,
        name: parentsTable.name,
        phone: parentsTable.phone,
        email: parentsTable.email,
        relationship: parentsTable.relationship,
        address: parentsTable.address,
        whatsappNumbers: parentsTable.whatsappNumbers,
        createdAt: parentsTable.createdAt,
        updatedAt: parentsTable.updatedAt,
      });

    return row;
  },

  async linkParentToStudent(studentId: string, parentId: string) {
    await db.insert(studentParentsTable).values({
      studentId,
      parentId,
    });
  },

  async findParentsByStudentId(studentId: string) {
    return db
      .select({
        id: parentsTable.id,
        userId: parentsTable.userId,
        name: parentsTable.name,
        phone: parentsTable.phone,
        email: parentsTable.email,
        relationship: parentsTable.relationship,
        address: parentsTable.address,
        createdAt: parentsTable.createdAt,
        updatedAt: parentsTable.updatedAt,
      })
      .from(parentsTable)
      .innerJoin(
        studentParentsTable,
        eq(studentParentsTable.parentId, parentsTable.id),
      )
      .where(eq(studentParentsTable.studentId, studentId));
  },

  async studentExists(studentId: string) {
    const student = await db.query.studentsTable.findFirst({
      where: eq(studentsTable.id, studentId),
    });
    return Boolean(student);
  },

  async isParentLinkedToStudent(userId: string, studentId: string) {
    const rows = await db
      .select({
        studentId: studentParentsTable.studentId,
      })
      .from(studentParentsTable)
      .innerJoin(
        parentsTable,
        eq(studentParentsTable.parentId, parentsTable.id),
      )
      .where(
        and(
          eq(studentParentsTable.studentId, studentId),
          eq(parentsTable.userId, userId),
        ),
      );

    return rows.length > 0;
  },
};
