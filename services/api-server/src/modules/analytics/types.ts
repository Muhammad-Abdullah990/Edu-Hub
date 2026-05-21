export type MonthlyAttendanceSummary = {
  period: string;
  presentDays: number;
  totalDays: number;
  percentage: number;
};

export type StudentAttendanceAnalytics = {
  studentId: string;
  overallPercentage: number;
  currentStreak: number;
  warning: boolean;
  absentPattern: string[];
  monthlyAttendance: MonthlyAttendanceSummary[];
};

export type ClassAttendanceSummary = {
  classId: string;
  section: string | null;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  classAveragePercentage: number;
  warningCount: number;
};
