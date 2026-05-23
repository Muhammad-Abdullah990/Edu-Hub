import argon2 from "argon2";
import { eq } from "drizzle-orm";
import { ROLE_NAMES, USER_STATUS } from "@toppers/auth";
import { db } from "../index";
import {
  rolesTable,
  userRolesTable,
  usersTable,
} from "../schema/auth";
import { studentsTable } from "../schema/school";

const DEMO_STUDENT_EMAIL = "student.demo@topperscoachingcenter.com";
const DEMO_STUDENT_PASSWORD = "ChangeMe123!";
const DEMO_TEACHER_EMAIL = "teacher.demo@topperscoachingcenter.com";
const DEMO_TEACHER_PASSWORD = "ChangeMe123!";

async function upsertPortalUser(
  email: string,
  password: string,
  name: string,
  roleName: (typeof ROLE_NAMES)[keyof typeof ROLE_NAMES],
) {
  const role = await db.query.rolesTable.findFirst({
    where: eq(rolesTable.name, roleName),
  });

  if (!role) {
    throw new Error(`${roleName} role missing. Run seed:auth first.`);
  }

  const passwordHash = await argon2.hash(password);

  await db
    .insert(usersTable)
    .values({
      name,
      email,
      passwordHash,
      roleId: role.id,
      status: USER_STATUS.ACTIVE,
    })
    .onConflictDoNothing();

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (!user) {
    return null;
  }

  await db
    .insert(userRolesTable)
    .values({
      userId: user.id,
      roleId: role.id,
      isPrimary: true,
    })
    .onConflictDoNothing();

  return user;
}

async function main() {
  const studentUser = await upsertPortalUser(
    DEMO_STUDENT_EMAIL,
    DEMO_STUDENT_PASSWORD,
    "Demo Student Portal User",
    ROLE_NAMES.STUDENT,
  );

  await upsertPortalUser(
    DEMO_TEACHER_EMAIL,
    DEMO_TEACHER_PASSWORD,
    "Demo Teacher Portal User",
    ROLE_NAMES.TEACHER,
  );

  if (studentUser) {
    const firstStudent = await db.query.studentsTable.findFirst({
      where: eq(studentsTable.studentCode, "STU-001"),
    });

    if (firstStudent) {
      await db
        .update(studentsTable)
        .set({ portalUserId: studentUser.id, updatedAt: new Date() })
        .where(eq(studentsTable.id, firstStudent.id));
    }
  }

  process.stdout.write(
    `Seeded portal users:\n` +
      `  student: ${DEMO_STUDENT_EMAIL} / ${DEMO_STUDENT_PASSWORD}\n` +
      `  teacher: ${DEMO_TEACHER_EMAIL} / ${DEMO_TEACHER_PASSWORD}\n`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
