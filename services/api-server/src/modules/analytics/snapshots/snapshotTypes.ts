export type AnalyticsSnapshotDomain =
  | "attendance_analytics"
  | "academic_analytics"
  | "fee_analytics"
  | "engagement_analytics"
  | "communication_analytics"
  | "institution_analytics";

export type SnapshotPeriod = string; // e.g., YYYY-MM

export type SnapshotKeyInput = {
  tenantId: string;
  domain: AnalyticsSnapshotDomain;
  snapshotPeriod: SnapshotPeriod;
  studentId?: string;
  classId?: string;
  section?: string | null;
  version?: number;
};

