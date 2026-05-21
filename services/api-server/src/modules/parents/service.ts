import { HttpError } from "../../lib/http-error";
import { auditService } from "../audit/service";
import { parentsRepository } from "./repository";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import type { ParentCreateInput, ParentResponse } from "./types";

export function createParentsService(repository = parentsRepository) {
  return {
    async createParentForStudent(
      actorUserId: string,
      studentId: string,
      input: ParentCreateInput,
    ) {
      const exists = await repository.studentExists(studentId);
      if (!exists) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      const parent = await repository.createParent(input);
      await repository.linkParentToStudent(studentId, parent.id);
      await auditService.log({
        userId: actorUserId,
        action: "parent.create",
        entityType: "student_parent",
        entityId: parent.id,
        metadata: {
          studentId,
          parentName: input.name,
        },
      });

      return {
        id: parent.id,
        userId: parent.userId,
        name: parent.name,
        phone: parent.phone,
        email: parent.email,
        relationship: parent.relationship,
        address: parent.address,
        createdAt: parent.createdAt.toISOString(),
        updatedAt: parent.updatedAt.toISOString(),
      };
    },

    async getParentsForStudent(
      auth: AuthenticatedPrincipal,
      studentId: string,
    ) {
      const exists = await repository.studentExists(studentId);
      if (!exists) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (auth.roles.includes("PARENT")) {
        const linked = await repository.isParentLinkedToStudent(auth.userId, studentId);
        if (!linked) {
          throw new HttpError(
            403,
            "STUDENT_FORBIDDEN",
            "Parent does not have access to this student",
          );
        }
      }

      const parents = await repository.findParentsByStudentId(studentId);
      return parents.map((parent) => ({
        id: parent.id,
        userId: parent.userId,
        name: parent.name,
        phone: auth.roles.includes("SUPER_ADMIN") || auth.roles.includes("ADMIN")
          ? parent.phone
          : null,
        email: parent.email,
        relationship: parent.relationship,
        address: parent.address,
        createdAt: parent.createdAt.toISOString(),
        updatedAt: parent.updatedAt.toISOString(),
      }));
    },
  };
}

export const parentsService = createParentsService();
