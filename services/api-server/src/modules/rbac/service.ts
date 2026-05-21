import type { PermissionName, PlatformRole } from "@toppers/auth";
import type { PermissionRecord, RoleRecord } from "./types";
import { rbacRepository } from "./repository";

function mapRole(role: Awaited<ReturnType<typeof rbacRepository.findRoleByName>>) {
  if (!role) {
    return null;
  }

  return {
    id: role.id,
    name: role.name as PlatformRole,
    description: role.description,
    permissions: role.rolePermissions.map(({ permission }) => ({
      id: permission.id,
      name: permission.name as PermissionName,
      description: permission.description,
    })),
  } satisfies RoleRecord;
}

export function createRbacService(repository = rbacRepository) {
  return {
    async listRoles(): Promise<RoleRecord[]> {
      const roles = await repository.listRoles();
      return roles
        .map((role) => mapRole(role))
        .filter((role): role is RoleRecord => role !== null);
    },

    async listPermissions(): Promise<PermissionRecord[]> {
      const permissions = await repository.listPermissions();
      return permissions.map((permission) => ({
        id: permission.id,
        name: permission.name as PermissionName,
        description: permission.description,
      }));
    },

    async getRoleByName(name: string) {
      return mapRole(await repository.findRoleByName(name));
    },
  };
}

export const rbacService = createRbacService();
