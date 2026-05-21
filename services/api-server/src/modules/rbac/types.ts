import type { PermissionName, PlatformRole } from "@toppers/auth";

export interface PermissionRecord {
  id: number;
  name: PermissionName;
  description: string;
}

export interface RoleRecord {
  id: number;
  name: PlatformRole;
  description: string;
  permissions: PermissionRecord[];
}
