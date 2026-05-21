import { HttpError } from "../../lib/http-error";
import { auditService } from "../audit/service";
import { parentsRepository } from "../parents/repository";
import { studentsRepository } from "./repository";
import type {
  StudentCardResponse,
  StudentListResponse,
  StudentProfileResponse,
  StudentPerformanceNoteSummary,
  StudentStatus,
} from "./types";
import type { ParentResponse } from "../parents/types";
import type { AuthenticatedPrincipal } from "@toppers/auth";

function formatTimestamp(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.toISOString();
}

function mapCardItem(
  student: Awaited<ReturnType<typeof studentsRepository.findStudents>>["students"][number],
  latestNote: StudentPerformanceNoteSummary | null,
): StudentCardResponse {
  return {
    id: student.id,
    studentCode: student.studentCode,
    fullName: student.fullName,
    class: student.class,
    section: student.section,
    photoUrl: student.photoUrl,
    status: student.status as StudentStatus,
    attendancePercentage:
      student.attendancePercentage === null
        ? null
        : Number(student.attendancePercentage),
    feeStatus: student.feeStatus ?? null,
    latestPerformanceNote: latestNote,
  };
}

function mapPerformanceNoteRow(
  row: Awaited<ReturnType<typeof studentsRepository.findPerformanceNotesForStudent>>[number],
): StudentPerformanceNoteSummary {
  return {
    id: row.id,
    note: row.note,
    authorName: row.author?.name ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapParentResponse(
  parent: ParentResponse,
  maskPhone: boolean,
): ParentResponse {
  return {
    ...parent,
    phone: maskPhone ? null : parent.phone,
  };
}

export function createStudentsService(repository = studentsRepository) {
  return {
    async createStudent(
      actorUserId: string,
      input: {
        studentCode: string;
        fullName: string;
        class: string;
        section: string;
        dateOfBirth: string;
        admissionDate: string;
        photoUrl: string;
        status?: StudentStatus;
      },
    ) {
      const existing = await repository.findStudentByCode(input.studentCode);
      if (existing) {
        throw new HttpError(409, "STUDENT_EXISTS", "Student code already exists");
      }

      const student = await repository.createStudent({
        studentCode: input.studentCode,
        fullName: input.fullName,
        class: input.class,
        section: input.section,
        dateOfBirth: input.dateOfBirth,
        admissionDate: input.admissionDate,
        photoUrl: input.photoUrl,
        status: input.status ?? "active",
      });

      await auditService.log({
        userId: actorUserId,
        action: "student.create",
        entityType: "student",
        entityId: student.id,
        metadata: {
          studentCode: input.studentCode,
          fullName: input.fullName,
        },
      });

      return { id: student.id };
    },

    async getStudentById(
      auth: AuthenticatedPrincipal,
      studentId: string,
    ): Promise<StudentProfileResponse> {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (
        auth.roles.includes("PARENT") &&
        !(await parentsRepository.isParentLinkedToStudent(auth.userId, studentId))
      ) {
        throw new HttpError(
          403,
          "STUDENT_FORBIDDEN",
          "Parent does not have access to this student",
        );
      }

      if (
        auth.roles.includes("PARENT") === false &&
        auth.roles.some((role) => ["SUPER_ADMIN", "ADMIN", "TEACHER"].includes(role)) === false
      ) {
        throw new HttpError(
          403,
          "STUDENT_FORBIDDEN",
          "User does not have access to this student",
        );
      }

      const profileNotes = await repository.findPerformanceNotesForStudent(studentId);
      const performanceNotes = profileNotes.map(mapPerformanceNoteRow);
      const parents = student.studentParents.map(({ parent }) =>
        mapParentResponse(
          {
            id: parent.id,
            userId: parent.userId,
            name: parent.name,
            phone: parent.phone,
            email: parent.email,
            relationship: parent.relationship as ParentResponse["relationship"],
            address: parent.address,
            createdAt: parent.createdAt.toISOString(),
            updatedAt: parent.updatedAt.toISOString(),
          },
          auth.roles.includes("SUPER_ADMIN") || auth.roles.includes("ADMIN") === true
            ? false
            : true,
        ),
      );

      return {
        id: student.id,
        studentCode: student.studentCode,
        fullName: student.fullName,
        class: student.class,
        section: student.section,
        dateOfBirth: student.dateOfBirth,
        admissionDate: student.admissionDate,
        status: student.status as StudentStatus,
        photoUrl: student.photoUrl,
        personalInfo: {
          studentCode: student.studentCode,
          fullName: student.fullName,
          class: student.class,
          section: student.section,
          dateOfBirth: student.dateOfBirth,
          admissionDate: student.admissionDate,
          status: student.status as StudentStatus,
        },
        attendanceSummary: {
          attendancePercentage:
            student.attendanceSummary?.attendancePercentage ?? null,
          presentDays: student.attendanceSummary?.presentDays ?? null,
          absentDays: student.attendanceSummary?.absentDays ?? null,
          totalDays: student.attendanceSummary?.totalDays ?? null,
          lastRecordedAt: formatTimestamp(student.attendanceSummary?.lastRecordedAt ?? null),
        },
        performanceNotes,
        academicProgress: {
          currentStanding: "Pending academic evaluation",
          latestObservation:
            performanceNotes[0]?.note ?? "No performance notes available",
          remarks: [],
        },
        feeStatus: {
          status: student.feeStatus?.status ?? null,
          outstandingAmount:
            student.feeStatus?.outstandingAmount ?? null,
          dueDate: student.feeStatus?.dueDate ?? null,
          updatedAt: formatTimestamp(student.feeStatus?.updatedAt ?? null),
        },
        reportsHistory: {
          placeholder: true,
          items: [],
        },
        parents,
      };
    },

    async getStudents(
      filters: Parameters<typeof repository.findStudents>[0],
    ): Promise<StudentListResponse> {
      const result = await repository.findStudents(filters);
      const studentIds = result.students.map((student) => student.id);
      const latestNotes = await repository.findLatestPerformanceNotesForStudentIds(
        studentIds,
      );

      const noteMap = new Map<string, StudentPerformanceNoteSummary>();
      for (const note of latestNotes) {
        if (!noteMap.has(note.studentId)) {
          noteMap.set(note.studentId, {
            id: note.id,
            note: note.note,
            authorName: null,
            createdAt: note.createdAt.toISOString(),
          });
        }
      }

      return {
        students: result.students.map((student) =>
          mapCardItem(student, noteMap.get(student.id) ?? null),
        ),
        meta: {
          total: result.total,
          page: filters.page,
          limit: filters.limit,
        },
      };
    },

    async updateStudent(
      actorUserId: string,
      auth: AuthenticatedPrincipal,
      studentId: string,
      input: Partial<{
        studentCode: string;
        fullName: string;
        class: string;
        section: string;
        dateOfBirth: string;
        admissionDate: string;
        photoUrl: string;
        status: StudentStatus;
      }>,
    ) {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (input.studentCode && input.studentCode !== student.studentCode) {
        const existing = await repository.findStudentByCode(input.studentCode);
        if (existing) {
          throw new HttpError(
            409,
            "STUDENT_CODE_IN_USE",
            "Student code is already in use",
          );
        }
      }

      await repository.updateStudent(studentId, {
        studentCode: input.studentCode,
        fullName: input.fullName,
        class: input.class,
        section: input.section,
        dateOfBirth: input.dateOfBirth,
        admissionDate: input.admissionDate,
        photoUrl: input.photoUrl,
        status: input.status,
      });

      await auditService.log({
        userId: actorUserId,
        action: "student.update",
        entityType: "student",
        entityId: studentId,
        metadata: { updates: input },
      });

      return await this.getStudentById(auth, studentId);
    },

    async archiveStudent(actorUserId: string, studentId: string) {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (student.status === "archived") {
        throw new HttpError(
          400,
          "STUDENT_ALREADY_ARCHIVED",
          "Student is already archived",
        );
      }

      await repository.archiveStudent(studentId);

      await auditService.log({
        userId: actorUserId,
        action: "student.archive",
        entityType: "student",
        entityId: studentId,
        metadata: {
          studentCode: student.studentCode,
          fullName: student.fullName,
        },
      });

      return {
        status: "ok",
        message: "Student archived successfully",
      };
    },

    async restoreStudent(actorUserId: string, studentId: string) {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (student.status === "active") {
        throw new HttpError(
          400,
          "STUDENT_NOT_ARCHIVED",
          "Student is not archived",
        );
      }

      await repository.restoreStudent(studentId);

      await auditService.log({
        userId: actorUserId,
        action: "student.restore",
        entityType: "student",
        entityId: studentId,
        metadata: {
          studentCode: student.studentCode,
          fullName: student.fullName,
        },
      });

      return {
        status: "ok",
        message: "Student restored successfully",
      };
    },

    async deleteStudent(actorUserId: string, studentId: string) {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      await repository.deleteStudent(studentId);
      await auditService.log({
        userId: actorUserId,
        action: "student.delete",
        entityType: "student",
        entityId: studentId,
      });

      return {
        status: "ok",
        message: "Student removed permanently",
      };
    },
  };
}

export const studentsService = createStudentsService();
