export type AttendanceStatus = "present" | "absent";

export type AttendanceRecord = {
  studentId: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  status: string | null;
  attendanceDate: string | null;
  markedBy: string | null;
};

export type AttendanceBulkResult = {
  updated: number;
};
