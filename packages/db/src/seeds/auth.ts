import argon2 from "argon2";
import { and, eq } from "drizzle-orm";
import {
  PERMISSION_NAMES,
  ROLE_NAMES,
  USER_STATUS,
} from "@toppers/auth";
import { db } from "../index";
import {
  permissionsTable,
  rolePermissionsTable,
  rolesTable,
  userRolesTable,
  usersTable,
} from "../schema";

const DEFAULT_ADMIN_EMAIL = "info@topperscoachingcenter.com";
const DEFAULT_ADMIN_PASSWORD = "ChangeMe123!";

const roleSeed = [
  {
    name: ROLE_NAMES.SUPER_ADMIN,
    description: "Full system access across Edu-OS.",
    permissions: Object.values(PERMISSION_NAMES),
  },
  {
    name: ROLE_NAMES.ADMIN,
    description: "Administrative access for student, parent, and performance operations.",
    permissions: [
      PERMISSION_NAMES.STUDENTS_READ,
      PERMISSION_NAMES.STUDENTS_WRITE,
      PERMISSION_NAMES.STUDENTS_DELETE,
      PERMISSION_NAMES.PARENTS_READ,
      PERMISSION_NAMES.PARENTS_WRITE,
      PERMISSION_NAMES.PERFORMANCE_READ,
      PERMISSION_NAMES.PERFORMANCE_WRITE,
      PERMISSION_NAMES.AUTH_SESSION_MANAGE_SELF,
    ],
  },
  {
    name: ROLE_NAMES.TEACHER,
    description: "Teacher access for attendance and academic operations.",
    permissions: [
      PERMISSION_NAMES.ATTENDANCE_READ,
      PERMISSION_NAMES.ATTENDANCE_WRITE,
      PERMISSION_NAMES.PERFORMANCE_READ,
      PERMISSION_NAMES.PERFORMANCE_WRITE,
      PERMISSION_NAMES.USERS_READ,
      PERMISSION_NAMES.AUTH_SESSION_MANAGE_SELF,
    ],
  },
  {
    name: ROLE_NAMES.STUDENT,
    description: "Student self-service access.",
    permissions: [
      PERMISSION_NAMES.STUDENT_DASHBOARD_READ_SELF,
      PERMISSION_NAMES.AUTH_SESSION_MANAGE_SELF,
    ],
  },
  {
    name: ROLE_NAMES.PARENT,
    description: "Parent/guardian access to child information.",
    permissions: [
      PERMISSION_NAMES.PARENT_CHILDREN_READ,
      PERMISSION_NAMES.AUTH_SESSION_MANAGE_SELF,
    ],
  },
] as const;

async function upsertRolesAndPermissions() {
  for (const role of roleSeed) {
    await db
      .insert(rolesTable)
      .values({
        name: role.name,
        description: role.description,
      })
      .onConflictDoUpdate({
        target: rolesTable.name,
        set: { description: role.description },
      });
  }

  for (const permissionName of Object.values(PERMISSION_NAMES)) {
    await db
      .insert(permissionsTable)
      .values({
        name: permissionName,
        description: permissionName,
      })
      .onConflictDoNothing();
  }

  const roles = await db.select().from(rolesTable);
  const permissions = await db.select().from(permissionsTable);
  const permissionIdByName = new Map(
    permissions.map((permission) => [permission.name, permission.id]),
  );

  for (const role of roleSeed) {
    const roleRow = roles.find((candidate) => candidate.name === role.name);
    if (!roleRow) continue;

    for (const permissionName of role.permissions) {
      const permissionId = permissionIdByName.get(permissionName);
      if (!permissionId) continue;

      await db
        .insert(rolePermissionsTable)
        .values({
          roleId: roleRow.id,
          permissionId,
        })
        .onConflictDoNothing();
    }
  }
}

async function seedAdminUser() {
  const superAdminRole = await db.query.rolesTable.findFirst({
    where: eq(rolesTable.name, ROLE_NAMES.SUPER_ADMIN),
  });

  if (!superAdminRole) {
    throw new Error("SUPER_ADMIN role missing. Seed roles before users.");
  }

  const passwordHash = await argon2.hash(DEFAULT_ADMIN_PASSWORD);

  await db
    .insert(usersTable)
    .values({
      name: "Toppers Coaching Center Admin",
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      roleId: superAdminRole.id,
      status: USER_STATUS.ACTIVE,
    })
    .onConflictDoNothing();

  const adminUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, DEFAULT_ADMIN_EMAIL),
  });

  if (!adminUser) {
    return;
  }

  const existingPrimaryRole = await db.query.userRolesTable.findFirst({
    where: and(
      eq(userRolesTable.userId, adminUser.id),
      eq(userRolesTable.roleId, superAdminRole.id),
    ),
  });

  if (!existingPrimaryRole) {
    await db.insert(userRolesTable).values({
      userId: adminUser.id,
      roleId: superAdminRole.id,
      isPrimary: true,
    });
  }
}

async function main() {
  await upsertRolesAndPermissions();
  await seedAdminUser();
  process.stdout.write(
    `Seeded auth roles and default admin ${DEFAULT_ADMIN_EMAIL}\n`,
  );
}

import pino from "pino";
const logger = pino();

main()
  .catch((error) => {
    logger.error({ error }, "Failed to seed auth data");
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
