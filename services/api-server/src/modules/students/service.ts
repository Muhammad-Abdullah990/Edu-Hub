import { HttpError } from "../../lib/http-error";
import { auditService } from "../audit/service";
import { parentsRepository } from "../parents/repository";
import { reportsRepository } from "../reports/repository";
import { studentsRepository } from "./repository";
import type {
  PublicStudentCardResponse,
  StudentCardResponse,
  StudentListResponse,
  StudentProfileResponse,
  StudentPublicProfileResponse,
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
    portalUserId: "portalUserId" in student ? (student.portalUserId as string | null) : null,
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

function slugifyStudentName(fullName: string) {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
        monthlyFeeAmount?: number;
        feeCycleStartDate?: string;
      },
    ) {
      // Auto-generate student code if not provided or coming from UI (empty placeholder)
      let studentCode = input.studentCode.trim();
      if (!studentCode || studentCode.startsWith("STU-")) {
        const count = await repository.countStudents();
        const nextNum = (count ?? 0) + 1;
        studentCode = `STU-${String(nextNum).padStart(3, "0")}`;
      }

      const existing = await repository.findStudentByCode(studentCode);
      if (existing) {
        // If auto-generated code collides, increment until unique
        let attempt = 1;
        while (existing) {
          const count = await repository.countStudents();
          const nextNum = (count ?? 0) + attempt + 1;
          studentCode = `STU-${String(nextNum).padStart(3, "0")}`;
          const retry = await repository.findStudentByCode(studentCode);
          if (!retry) break;
          attempt++;
        }
      }

      // Calculate next fee due date if fee cycle start date is provided
      let nextFeeDueDate: string | null = null;
      if (input.feeCycleStartDate) {
        const cycleStart = new Date(input.feeCycleStartDate);
        const nextDue = new Date(cycleStart);
        nextDue.setDate(nextDue.getDate() + 30); // 30-day fee cycle
        nextFeeDueDate = nextDue.toISOString().split('T')[0];
      }

      const student = await repository.createStudent({
        studentCode,
        fullName: input.fullName,
        class: input.class,
        section: input.section,
        dateOfBirth: input.dateOfBirth,
        admissionDate: input.admissionDate,
        photoUrl: input.photoUrl,
        status: input.status ?? "active",
        monthlyFeeAmount: input.monthlyFeeAmount ?? 0,
        feeCycleStartDate: input.feeCycleStartDate ?? null,
        nextFeeDueDate,
      });

      await auditService.log({
        userId: actorUserId,
        action: "student.create",
        entityType: "student",
        entityId: student.id,
        metadata: {
          studentCode: input.studentCode,
          fullName: input.fullName,
          monthlyFeeAmount: input.monthlyFeeAmount,
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

      if (auth.roles.includes("STUDENT")) {
        if (student.portalUserId !== auth.userId) {
          throw new HttpError(
            403,
            "STUDENT_FORBIDDEN",
            "Student account is not linked to this profile",
          );
        }
      } else if (
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
          placeholder: false,
          items: await Promise.all(
            (await reportsRepository.findReportsByStudentId(studentId)).map(
              (report) => ({
                id: report.id,
                month: report.month,
                status: report.status,
                createdAt: report.createdAt.toISOString(),
              }),
            ),
          ),
        },
        parents,
      };
    },

    async linkPortalUser(
      actorUserId: string,
      studentId: string,
      portalUserId: string | null,
    ) {
      const student = await repository.findStudentById(studentId);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      if (portalUserId) {
        const existing = await repository.findStudentByPortalUserId(portalUserId);
        if (existing && existing.id !== studentId) {
          throw new HttpError(
            409,
            "PORTAL_USER_ALREADY_LINKED",
            "Portal user is already linked to another student",
          );
        }
      }

      await repository.linkPortalUser(studentId, portalUserId);

      await auditService.log({
        userId: actorUserId,
        action: "student.link_portal_user",
        entityType: "student",
        entityId: studentId,
        metadata: { portalUserId },
      });

      return { studentId, portalUserId };
    },

    async getMyStudentProfile(
      auth: AuthenticatedPrincipal,
    ): Promise<StudentProfileResponse> {
      const linked = await repository.findStudentByPortalUserId(auth.userId);
      if (!linked) {
        throw new HttpError(
          404,
          "STUDENT_NOT_LINKED",
          "No student profile is linked to this account",
        );
      }

      return this.getStudentById(auth, linked.id);
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

    async getPublicStudents(): Promise<{ students: PublicStudentCardResponse[] }> {
      const result = await repository.findStudents({
        page: 1,
        limit: 100,
        sortBy: "fullName",
        sortOrder: "asc",
      });
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
        students: result.students.map((student) => ({
          ...mapCardItem(student, noteMap.get(student.id) ?? null),
          slug: slugifyStudentName(student.fullName),
          studentCode: student.studentCode,
          status: student.status as StudentStatus,
          admissionDate: student.admissionDate,
        })),
      };
    },

    async getPublicStudentBySlug(
      slug: string,
    ): Promise<StudentPublicProfileResponse> {
      const result = await repository.findStudents({
        page: 1,
        limit: 100,
        sortBy: "fullName",
        sortOrder: "asc",
      });
      const publicStudent = result.students.find(
        (student) => slugifyStudentName(student.fullName) === slug,
      );

      if (!publicStudent) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      const student = await repository.findStudentById(publicStudent.id);
      if (!student) {
        throw new HttpError(404, "STUDENT_NOT_FOUND", "Student not found");
      }

      const performanceNotes = (
        await repository.findPerformanceNotesForStudent(student.id)
      ).map(mapPerformanceNoteRow);

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
        attendanceSummary: {
          attendancePercentage:
            student.attendanceSummary?.attendancePercentage ?? null,
          presentDays: student.attendanceSummary?.presentDays ?? null,
          absentDays: student.attendanceSummary?.absentDays ?? null,
          totalDays: student.attendanceSummary?.totalDays ?? null,
          lastRecordedAt: formatTimestamp(student.attendanceSummary?.lastRecordedAt ?? null),
        },
        feeStatus: {
          status: student.feeStatus?.status ?? null,
          outstandingAmount:
            student.feeStatus?.outstandingAmount ?? null,
          dueDate: student.feeStatus?.dueDate ?? null,
          updatedAt: formatTimestamp(student.feeStatus?.updatedAt ?? null),
        },
        performanceNotes,
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
