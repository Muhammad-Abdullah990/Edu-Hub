import type { ParentResponse } from "../parents/types";

export type StudentStatus = "active" | "archived";

export type StudentPerformanceNoteSummary = {
  id: string;
  note: string;
  authorName: string | null;
  createdAt: string;
};

export type StudentReportHistoryItem = {
  id: string;
  month: string;
  status: string;
  createdAt: string;
};

export type StudentCardResponse = {
  id: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  photoUrl: string;
  status: StudentStatus;
  portalUserId?: string | null;
  attendancePercentage: number | null;
  feeStatus: string | null;
  latestPerformanceNote: StudentPerformanceNoteSummary | null;
};

export type PublicStudentCardResponse = StudentCardResponse & {
  slug: string;
  studentCode: string;
  status: StudentStatus;
  admissionDate: string;
};

export type StudentPublicProfileResponse = {
  id: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  dateOfBirth: string;
  admissionDate: string;
  status: StudentStatus;
  photoUrl: string;
  attendanceSummary: {
    attendancePercentage: number | null;
    presentDays: number | null;
    absentDays: number | null;
    totalDays: number | null;
    lastRecordedAt: string | null;
  };
  feeStatus: {
    status: string | null;
    outstandingAmount: number | null;
    dueDate: string | null;
    updatedAt: string | null;
  };
  performanceNotes: StudentPerformanceNoteSummary[];
};

export type StudentProfileResponse = {
  id: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  dateOfBirth: string;
  admissionDate: string;
  status: StudentStatus;
  photoUrl: string;
  personalInfo: {
    studentCode: string;
    fullName: string;
    class: string;
    section: string;
    dateOfBirth: string;
    admissionDate: string;
    status: StudentStatus;
  };
  attendanceSummary: {
    attendancePercentage: number | null;
    presentDays: number | null;
    absentDays: number | null;
    totalDays: number | null;
    lastRecordedAt: string | null;
  };
  performanceNotes: StudentPerformanceNoteSummary[];
  academicProgress: {
    currentStanding: string;
    latestObservation: string | null;
    remarks: string[];
  };
  feeStatus: {
    status: string | null;
    outstandingAmount: number | null;
    dueDate: string | null;
    updatedAt: string | null;
  };
  reportsHistory: {
    placeholder: boolean;
    items: StudentReportHistoryItem[];
  };
  parents: ParentResponse[];
};

export type StudentListMeta = {
  total: number;
  page: number;
  limit: number;
};

export type StudentListResponse = {
  students: StudentCardResponse[];
  meta: StudentListMeta;
};
