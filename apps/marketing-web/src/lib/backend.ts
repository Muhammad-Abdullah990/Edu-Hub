import { AUTH_COOKIE_NAMES } from "@toppers/auth";
import { readCookie } from "@/lib/cookie-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

type TokenGetter = () => string | null | undefined;

let accessTokenGetter: TokenGetter | null = null;
let csrfTokenGetter: TokenGetter | null = null;

/** Register getters used by portal API helpers (mirrors @toppers/api-client auth wiring). */
export function setBackendAuthGetters(getters: {
  accessToken?: TokenGetter | null;
  csrfToken?: TokenGetter | null;
}) {
  accessTokenGetter = getters.accessToken ?? null;
  csrfTokenGetter = getters.csrfToken ?? null;
}

function getCsrfToken(): string | null {
  return csrfTokenGetter?.() ?? readCookie(AUTH_COOKIE_NAMES.CSRF_TOKEN) ?? null;
}

async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith("/") ? `${API_BASE_URL}${path}` : path;
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers ?? {});

  const accessToken = accessTokenGetter?.();
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const csrfToken = getCsrfToken();
  if (csrfToken && method !== "GET" && method !== "HEAD") {
    headers.set("X-CSRF-Token", csrfToken);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    let errorMessage = text;
    try {
      const parsed = JSON.parse(text);
      errorMessage = parsed?.message || parsed?.error || JSON.stringify(parsed);
    } catch {
      errorMessage = text || response.statusText;
    }
    throw new Error(`Request failed: ${response.status} ${response.statusText} - ${errorMessage}`);
  }

  if (response.status === 204 || response.headers.get("Content-Length") === "0") {
    return {} as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface StudentCard {
  id: string;
  fullName: string;
  class: string;
  section: string;
  portalUserId?: string | null;
  attendancePercentage?: number | null;
  feeStatus?: {
    status: string;
    outstandingAmount?: number | null;
    dueDate?: string | null;
  };
  photoUrl?: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  class: string;
  section: string;
  photoUrl?: string;
  attendancePercentage?: number | null;
  feeStatus?: {
    status?: string;
    outstandingAmount?: number | null;
    dueDate?: string | null;
  };
  reportsHistory?: Array<{ id: string; month: string; status: string; createdAt: string }>;
}

export interface PublicStudentCard extends StudentCard {
  slug: string;
  studentCode: string;
  status: string;
  admissionDate: string;
}

export interface StudentPublicProfile extends StudentProfile {
  studentCode: string;
  dateOfBirth: string;
  admissionDate: string;
  status: string;
  attendanceSummary: {
    attendancePercentage: number | null;
    presentDays: number | null;
    absentDays: number | null;
    totalDays: number | null;
    lastRecordedAt: string | null;
  };
  performanceNotes: Array<{ id: string; note: string; authorName: string | null; createdAt: string }>;
}

export interface ReportItem {
  id: string;
  month: string;
  status: string;
  createdAt: string;
}

export interface SystemHealthStatus {
  status: string;
  [key: string]: unknown;
}

export interface DashboardStatus {
  timestamp: string;
  systemHealth: SystemHealthStatus;
  queues: Array<{ queueType: string; size: number; processing: number; failed: number; delayed: number }>;
  automation: { pendingWorkflows: number; totalWorkflows: number; lastUpdate: string };
  analytics: { lastDailyAggregation?: string; lastMonthlyAggregation?: string; cacheHits: number; cacheMisses: number };
  performance: { uptime: number; memory: { heapUsed: number; heapTotal: number }; cpu: { user: number; system: number } };
}

export interface SystemInfo {
  timestamp: string;
  systemHealth: SystemHealthStatus;
  performance: DashboardStatus["performance"];
  uptime: number;
  nodeVersion: string;
  environment: string;
}

export async function getAdminDashboard(): Promise<DashboardStatus> {
  return fetchJson<DashboardStatus>("/admin/dashboard");
}

export async function getPendingWorkflows(): Promise<{ count: number; workflows: Array<{ id: string; jobId: string; status: string; workflowType: string; studentId: string; createdAt: string }> }> {
  return fetchJson("/admin/workflows/pending");
}

export async function approveWorkflow(workflowId: string, approvedBy: string): Promise<{ status: string; workflowId: string }> {
  return fetchJson(`/admin/workflows/${encodeURIComponent(workflowId)}/approve`, {
    method: "POST",
    body: JSON.stringify({ approvedBy }),
  });
}

export async function rejectWorkflow(workflowId: string, reason: string): Promise<{ status: string; workflowId: string }> {
  return fetchJson(`/admin/workflows/${encodeURIComponent(workflowId)}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function getSystemInfo(): Promise<SystemInfo> {
  return fetchJson<SystemInfo>("/admin/system-info");
}

export async function getTeacherStudents(): Promise<StudentCard[]> {
  const response = await fetchJson<ApiResponse<StudentCard[]>>("/students?limit=500");
  return response.data;
}

export async function getPublicStudents(): Promise<PublicStudentCard[]> {
  const response = await fetchJson<ApiResponse<PublicStudentCard[]>>("/public/students");
  return response.data;
}

export async function getPublicStudentBySlug(slug: string): Promise<StudentPublicProfile> {
  const response = await fetchJson<ApiResponse<StudentPublicProfile>>(`/public/students/slug/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function getMyStudentProfile(): Promise<StudentProfile> {
  const response = await fetchJson<ApiResponse<StudentProfile>>("/students/me");
  return response.data;
}

export async function getStudentProfile(studentId: string): Promise<StudentProfile> {
  const response = await fetchJson<ApiResponse<StudentProfile>>(`/students/${encodeURIComponent(studentId)}`);
  return response.data;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  description: string;
  amountDue: number;
  amountPaid: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  status: string;
  primaryRole: { id: number; name: string; description: string };
}

export interface ParentRecord {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  relationship: string;
}

export interface ActiveSession {
  id: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  expiresAt: string;
  lastUsedAt: string | null;
}

export interface CommunicationQueueItem {
  id: string;
  studentId: string;
  channel: string;
  status: string;
  reviewStatus: string;
  message: string;
  createdAt: string;
}

export interface AuditLogRow {
  id: string;
  userId: string | null;
  userName: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
}

export interface RbacRole {
  id: number;
  name: string;
  description: string;
}

export async function listFeeRecords(studentId?: string): Promise<FeeRecord[]> {
  const query = studentId ? `?studentId=${encodeURIComponent(studentId)}` : "";
  const response = await fetchJson<ApiResponse<FeeRecord[]>>(`/fees/records${query}`);
  return response.data;
}

export async function listCommunicationQueue(): Promise<CommunicationQueueItem[]> {
  const response = await fetchJson<ApiResponse<CommunicationQueueItem[]>>("/communications/queue");
  return response.data;
}

export async function listAuditLogs(limit = 50): Promise<AuditLogRow[]> {
  const response = await fetchJson<ApiResponse<AuditLogRow[]>>(`/audit/logs?limit=${limit}`);
  return response.data;
}

export async function listRoles(): Promise<RbacRole[]> {
  const response = await fetchJson<ApiResponse<RbacRole[]>>("/roles");
  return response.data;
}

export async function getClassAttendanceSummary(classId: string): Promise<Record<string, unknown>> {
  return fetchJson(`/analytics/class/${encodeURIComponent(classId)}/summary`);
}

export async function listUsers(limit = 100): Promise<PlatformUser[]> {
  const response = await fetchJson<ApiResponse<PlatformUser[]>>(`/users?limit=${limit}`);
  return response.data;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  roleName: string;
  studentCode?: string;
  class?: string;
  section?: string;
  monthlyFeeAmount?: number;
  feeCycleStartDate?: string;
}): Promise<PlatformUser> {
  const response = await fetchJson<ApiResponse<PlatformUser>>("/users", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function linkStudentPortalUser(
  studentId: string,
  portalUserId: string | null,
): Promise<{ studentId: string; portalUserId: string | null }> {
  const response = await fetchJson<
    ApiResponse<{ studentId: string; portalUserId: string | null }>
  >(`/students/${encodeURIComponent(studentId)}/portal-user`, {
    method: "PATCH",
    body: JSON.stringify({ portalUserId }),
  });
  return response.data;
}

export async function generateReport(input: {
  studentId: string;
  month: string;
  teacherNote: string;
  strengths: string[];
  weaknesses: string[];
}): Promise<{ jobId?: string; reportId?: string }> {
  const response = await fetchJson<ApiResponse<{ jobId?: string; reportId?: string }>>(
    "/reports/generate",
    { method: "POST", body: JSON.stringify(input) },
  );
  return response.data;
}

export async function getParentsForStudent(studentId: string): Promise<ParentRecord[]> {
  const response = await fetchJson<ApiResponse<ParentRecord[]>>(
    `/students/${encodeURIComponent(studentId)}/parents`,
  );
  return response.data;
}

export async function listMySessions(): Promise<ActiveSession[]> {
  const response = await fetchJson<ApiResponse<ActiveSession[]>>("/sessions/me");
  return response.data;
}

export async function revokeSession(sessionId: string): Promise<void> {
  await fetchJson(`/sessions/${encodeURIComponent(sessionId)}/revoke`, { method: "POST" });
}

export async function getStudentReports(studentId: string): Promise<ReportItem[]> {
  const response = await fetchJson<ApiResponse<ReportItem[]>>(`/reports/student/${encodeURIComponent(studentId)}`);
  return response.data;
}

export async function downloadReport(reportId: string): Promise<void> {
  const headers = new Headers();
  const accessToken = accessTokenGetter?.();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${API_BASE_URL}/reports/download/${encodeURIComponent(reportId)}`, {
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Unable to download report: ${response.status} ${response.statusText} - ${text}`);
  }

  const blob = await response.blob();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `student-report-${reportId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
