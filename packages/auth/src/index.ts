export const ROLE_NAMES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
} as const;

export type PlatformRole = (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES];

export const USER_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export const PERMISSION_NAMES = {
  ADMIN_MANAGE: "admin:manage",
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",
  ROLES_READ: "roles:read",
  PERMISSIONS_READ: "permissions:read",
  ATTENDANCE_WRITE: "attendance:write",
  ATTENDANCE_READ: "attendance:read",
  PERFORMANCE_WRITE: "performance:write",
  PERFORMANCE_READ: "performance:read",
  STUDENTS_READ: "students:read",
  STUDENTS_WRITE: "students:write",
  STUDENTS_DELETE: "students:delete",
  PARENTS_READ: "parents:read",
  PARENTS_WRITE: "parents:write",
  STUDENT_DASHBOARD_READ_SELF: "student-dashboard:read:self",
  PARENT_CHILDREN_READ: "parent-children:read",
  AUTH_SESSION_MANAGE_SELF: "auth-session:manage:self",
} as const;

export type PermissionName =
  (typeof PERMISSION_NAMES)[keyof typeof PERMISSION_NAMES];

export const AUTH_COOKIE_NAMES = {
  REFRESH_TOKEN: "toppers_refresh_token",
  CSRF_TOKEN: "toppers_csrf_token",
} as const;

export const AUTH_HEADER_NAMES = {
  CSRF: "x-csrf-token",
} as const;

export const AUTH_POLICY = {
  ACCESS_TOKEN_TTL_SECONDS: 60 * 15,
  REFRESH_TOKEN_TTL_SECONDS: 60 * 60 * 24 * 14,
  REFRESH_TOKEN_BYTES: 48,
  CSRF_TOKEN_BYTES: 32,
  COOKIE_PATH: "/api/auth",
} as const;

export interface AuthSession {
  userId: string;
  role: PlatformRole;
  tenantId?: string;
}

export interface AccessPolicy {
  resource: string;
  action: "read" | "write" | "delete" | "manage";
}

export interface AuthenticatedPrincipal {
  userId: string;
  sessionId: string;
  email: string;
  roles: PlatformRole[];
  permissions: PermissionName[];
  status: UserStatus;
}

export function hasPermission(
  permissions: readonly string[],
  permission: PermissionName,
): boolean {
  return permissions.includes(permission);
}
