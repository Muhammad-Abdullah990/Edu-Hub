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

export type DashboardAnalyticsSummary = {
  timestamp: string;
  studentStats: {
    totalStudents: number;
    activeClasses: string[];
    classCount: number;
  };
  staffStats: {
    totalTeachers: number;
    totalParents: number;
    parentLinks: number;
  };
  attendanceStats: {
    overallAverage: number;
    lowAttendanceCount: number;
    todayPresent: number;
    todayAbsent: number;
  };
  feeStats: {
    totalDue: number;
    totalCollected: number;
    pendingFees: number;
    overdueFees: number;
    collectionRate: number;
  };
  performanceStats: {
    recentNotes: number;
  };
  classDistribution: Array<{
    className: string;
    studentCount: number;
  }>;
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
