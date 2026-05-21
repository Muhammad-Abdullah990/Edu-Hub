import { HttpError } from "../../lib/http-error";
import { hashSecret } from "../../lib/security";
import { auditService } from "../audit/service";
import { sessionsService } from "../sessions/service";
import { usersRepository } from "./repository";
import type { UserResponse } from "./types";

function mapUser(user: Awaited<ReturnType<typeof usersRepository.findAccessProfileById>>): UserResponse | null {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    primaryRole: {
      id: user.primaryRole.id,
      name: user.primaryRole.name,
      description: user.primaryRole.description,
      permissions: user.primaryRole.permissions,
    },
    roles: user.roles.map((role: NonNullable<typeof user>["roles"][number]) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    })),
  };
}

export function createUsersService(repository = usersRepository) {
  return {
    async createUser(
      actorUserId: string,
      input: {
        name: string;
        email: string;
        password: string;
        roleName: Parameters<typeof repository.findRoleByName>[0];
      },
    ) {
      const existingUser = await repository.findAccessProfileByEmail(input.email);
      if (existingUser) {
        throw new HttpError(409, "USER_EXISTS", "Email is already in use");
      }

      const role = await repository.findRoleByName(input.roleName);
      if (!role) {
        throw new HttpError(400, "ROLE_NOT_FOUND", "Role not found");
      }

      const passwordHash = await hashSecret(input.password);
      const created = await repository.createUser({
        name: input.name,
        email: input.email,
        passwordHash,
        roleId: role.id,
        status: "active",
      });

      const createdUser = await repository.findAccessProfileById(created.id);
      await auditService.log({
        userId: actorUserId,
        action: "user.create",
        entityType: "user",
        entityId: created.id,
        metadata: { email: input.email, roleName: input.roleName },
      });

      return mapUser(createdUser);
    },

    async getUserById(requestedUserId: string) {
      const user = await repository.findAccessProfileById(requestedUserId);
      if (!user) {
        throw new HttpError(404, "USER_NOT_FOUND", "User not found");
      }

      return mapUser(user);
    },

    async updateUser(
      actorUserId: string,
      requestedUserId: string,
      input: {
        name?: string;
        password?: string;
        roleName?: Parameters<typeof repository.findRoleByName>[0];
        status?: "active" | "inactive";
      },
    ) {
      const existingUser = await repository.findAccessProfileById(requestedUserId);
      if (!existingUser) {
        throw new HttpError(404, "USER_NOT_FOUND", "User not found");
      }

      let roleId: number | undefined;
      if (input.roleName) {
        const role = await repository.findRoleByName(input.roleName);
        if (!role) {
          throw new HttpError(400, "ROLE_NOT_FOUND", "Role not found");
        }
        roleId = role.id;
      }

      const passwordHash = input.password
        ? await hashSecret(input.password)
        : undefined;

      await repository.updateUser(requestedUserId, {
        ...(input.name ? { name: input.name } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(passwordHash ? { passwordHash } : {}),
        ...(roleId ? { roleId } : {}),
      });

      if (input.password) {
        await auditService.log({
          userId: actorUserId,
          action: "user.password_change",
          entityType: "user",
          entityId: requestedUserId,
        });
      }

      const updatedUser = await repository.findAccessProfileById(requestedUserId);
      return mapUser(updatedUser);
    },

    async deleteUser(actorUserId: string, requestedUserId: string) {
      const existingUser = await repository.findAccessProfileById(requestedUserId);
      if (!existingUser) {
        throw new HttpError(404, "USER_NOT_FOUND", "User not found");
      }

      await repository.deactivateUser(requestedUserId);
      await sessionsService.revokeAllUserSessions(requestedUserId);
      await auditService.log({
        userId: actorUserId,
        action: "user.deactivate",
        entityType: "user",
        entityId: requestedUserId,
      });

      return {
        status: "ok",
        message: "User deactivated successfully",
      };
    },
  };
}

export const usersService = createUsersService();
