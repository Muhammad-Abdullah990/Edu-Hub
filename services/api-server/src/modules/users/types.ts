import type { PermissionName, PlatformRole, UserStatus } from "@toppers/auth";

export interface UserAccessProfile {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  primaryRole: {
    id: number;
    name: PlatformRole;
    description: string;
    permissions: { id: number; name: PermissionName; description: string }[];
  };
  roles: {
    id: number;
    name: PlatformRole;
    description: string;
    permissions: { id: number; name: PermissionName; description: string }[];
  }[];
  permissions: PermissionName[];
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  primaryRole: {
    id: number;
    name: PlatformRole;
    description: string;
    permissions: { id: number; name: PermissionName; description: string }[];
  };
  roles: {
    id: number;
    name: PlatformRole;
    description: string;
    permissions: { id: number; name: PermissionName; description: string }[];
  }[];
}
