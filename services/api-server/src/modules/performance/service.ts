import { ROLE_NAMES } from "@toppers/auth";
import type { AuthenticatedPrincipal } from "@toppers/auth";
import { HttpError } from "../../lib/http-error";
import { performanceRepository } from "./repository";
import type { PerformanceNoteResponse } from "./types";

export const performanceService = {
  async createPerformanceNote(
    auth: AuthenticatedPrincipal,
    input: {
      studentId: string;
      note: string;
      strengths: string;
      weaknesses: string;
      recommendations: string;
      behavioralNotes: string;
    },
  ): Promise<PerformanceNoteResponse> {
    if (
      auth.roles.includes(ROLE_NAMES.STUDENT) ||
      auth.roles.includes(ROLE_NAMES.PARENT)
    ) {
      throw new HttpError(
        403,
        "PERFORMANCE_NOTE_FORBIDDEN",
        "Only teachers and administrators may create performance notes",
      );
    }

    return performanceRepository.createPerformanceNote(auth.userId, input);
  },

  async getPerformanceNotes(
    auth: AuthenticatedPrincipal,
    studentId: string,
  ) {
    if (
      auth.roles.includes(ROLE_NAMES.STUDENT) ||
      auth.roles.includes(ROLE_NAMES.PARENT)
    ) {
      throw new HttpError(
        403,
        "PERFORMANCE_NOTE_FORBIDDEN",
        "Only teachers and administrators may view performance notes",
      );
    }

    return performanceRepository.findPerformanceNotesForStudent(studentId);
  },
};
