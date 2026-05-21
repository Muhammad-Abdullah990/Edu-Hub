import {
  db,
  rolesTable,
  userRolesTable,
  usersTable,
} from "@toppers/db";
import { eq } from "drizzle-orm";
import type { PermissionName, PlatformRole, UserStatus } from "@toppers/auth";

async function findUserWithRelationsById(userId: string) {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.id, userId),
    with: {
      primaryRole: {
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      },
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

async function findUserWithRelationsByEmail(email: string) {
  return db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
    with: {
      primaryRole: {
        with: {
          rolePermissions: {
            with: {
              permission: true,
            },
          },
        },
      },
      userRoles: {
        with: {
          role: {
            with: {
              rolePermissions: {
                with: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

type UserWithRelations = NonNullable<
  Awaited<ReturnType<typeof findUserWithRelationsById>>
>;

function mapAccessProfile(user: UserWithRelations) {
  const roles = user.userRoles.map(({ role }) => role);
  const permissions = Array.from(
    new Set(
      roles.flatMap((role) =>
        role.rolePermissions.map(({ permission }) => permission.name),
      ),
    ),
  );

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    status: user.status as UserStatus,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    primaryRole: {
      id: user.primaryRole.id,
      name: user.primaryRole.name as PlatformRole,
      description: user.primaryRole.description,
      permissions: user.primaryRole.rolePermissions.map(({ permission }) => ({
        id: permission.id,
        name: permission.name as PermissionName,
        description: permission.description,
      })),
    },
    roles: roles.map((role) => ({
      id: role.id,
      name: role.name as PlatformRole,
      description: role.description,
      permissions: role.rolePermissions.map(({ permission }) => ({
        id: permission.id,
        name: permission.name as PermissionName,
        description: permission.description,
      })),
    })),
    permissions,
  };
}

export const usersRepository = {
  async findAccessProfileById(userId: string) {
    const user = await findUserWithRelationsById(userId);

    return user ? mapAccessProfile(user) : null;
  },

  async findAccessProfileByEmail(email: string) {
    const user = await findUserWithRelationsByEmail(email);

    return user ? mapAccessProfile(user) : null;
  },

  async findRoleByName(roleName: PlatformRole) {
    return db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, roleName),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  },

  async createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    roleId: number;
    status: UserStatus;
  }) {
    const [user] = await db
      .insert(usersTable)
      .values(input)
      .returning({ id: usersTable.id });

    await db.insert(userRolesTable).values({
      userId: user.id,
      roleId: input.roleId,
      isPrimary: true,
    });

    return user;
  },

  async updateUser(
    userId: string,
    updates: Partial<{
      name: string;
      passwordHash: string;
      roleId: number;
      status: UserStatus;
    }>,
  ) {
    await db
      .update(usersTable)
      .set({
        ...(updates.name ? { name: updates.name } : {}),
        ...(updates.passwordHash
          ? { passwordHash: updates.passwordHash }
          : {}),
        ...(updates.roleId ? { roleId: updates.roleId } : {}),
        ...(updates.status ? { status: updates.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    if (updates.roleId) {
      await db.delete(userRolesTable).where(eq(userRolesTable.userId, userId));
      await db.insert(userRolesTable).values({
        userId,
        roleId: updates.roleId,
        isPrimary: true,
      });
    }
  },

  async deactivateUser(userId: string) {
    await db
      .update(usersTable)
      .set({
        status: "inactive",
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  },

  async touchLastLogin(userId: string) {
    await db
      .update(usersTable)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  },
};
