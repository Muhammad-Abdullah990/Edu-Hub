import { ROLE_NAMES } from "@toppers/auth";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import { HttpError } from "../../lib/http-error";
import { attendanceRepository } from "./repository";
import type { AttendanceBulkResult, AttendanceRecord } from "./types";

export const attendanceService = {
  async markAttendanceBulk(
    actorId: string,
    auth: AuthenticatedPrincipal,
    input: {
      class: string;
      section?: string;
      date: string;
      items: Array<{ studentId: string; status: "present" | "absent" }>;
    },
  ): Promise<AttendanceBulkResult> {
    if (
      auth.roles.includes(ROLE_NAMES.STUDENT) ||
      auth.roles.includes(ROLE_NAMES.PARENT)
    ) {
      throw new HttpError(
        403,
        "ATTENDANCE_FORBIDDEN",
        "Only teachers and administrators may mark attendance",
      );
    }

    const hasDuplicateStudentIds =
      new Set(input.items.map((item) => item.studentId)).size !==
      input.items.length;
    if (hasDuplicateStudentIds) {
      throw new HttpError(
        400,
        "DUPLICATE_ATTENDANCE_ENTRIES",
        "Duplicate attendance entries for the same student are not allowed",
      );
    }

    return attendanceRepository.markAttendanceBulk(actorId, input);
  },

  async getClassAttendance(
    auth: AuthenticatedPrincipal,
    classId: string,
    date: string,
    section?: string,
  ): Promise<AttendanceRecord[]> {
    if (
      auth.roles.includes(ROLE_NAMES.STUDENT) ||
      auth.roles.includes(ROLE_NAMES.PARENT)
    ) {
      throw new HttpError(
        403,
        "ATTENDANCE_FORBIDDEN",
        "Only teachers and administrators may view class attendance",
      );
    }

    return attendanceRepository.findAttendanceByClassDate(classId, date, section);
  },
};
