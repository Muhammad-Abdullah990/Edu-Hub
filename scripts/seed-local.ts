import { pool, db, usersTable, rolesTable, permissionsTable, rolePermissionsTable, sessionsTable } from "@toppers/db";
import { hash } from "argon2";

async function seed() {
  console.log("Seeding local database...");

  // Create permissions
  await db.insert(permissionsTable).values([
    { id: "00000000-0000-0000-0000-000000000001", name: "students:read", description: "View students" },
    { id: "00000000-0000-0000-0000-000000000002", name: "students:write", description: "Manage students" },
    { id: "00000000-0000-0000-0000-000000000003", name: "attendance:read", description: "View attendance" },
    { id: "00000000-0000-0000-0000-000000000004", name: "attendance:write", description: "Manage attendance" },
    { id: "00000000-0000-0000-0000-000000000005", name: "fees:read", description: "View fees" },
    { id: "00000000-0000-0000-0000-000000000006", name: "fees:write", description: "Manage fees" },
    { id: "00000000-0000-0000-0000-000000000007", name: "reports:read", description: "View reports" },
    { id: "00000000-0000-0000-0000-000000000008", name: "users:manage", description: "Manage users" },
    { id: "00000000-0000-0000-0000-000000000009", name: "analytics:read", description: "View analytics" },
    { id: "00000000-0000-0000-0000-000000000010", name: "settings:manage", description: "Manage settings" },
  ]).onConflictDoNothing().execute();

  // Create admin role
  const adminRoleId = "00000000-0000-0000-0000-000000000101";
  await db.insert(rolesTable).values({
    id: adminRoleId,
    name: "admin",
    description: "Full system administrator",
  }).onConflictDoNothing().execute();

  // Assign all permissions to admin role
  for (let i = 1; i <= 10; i++) {
    const permId = `00000000-0000-0000-0000-${String(i).padStart(12, "0")}`;
    await db.insert(rolePermissionsTable).values({
      roleId: adminRoleId,
      permissionId: permId,
    }).onConflictDoNothing().execute();
  }

  // Create admin user
  const passwordHash = await hash("Admin@123");
  const adminUserId = "00000000-0000-0000-0000-000000000201";
  await db.insert(usersTable).values({
    id: adminUserId,
    name: "Admin",
    email: "info@topperscoachingcenter.com",
    passwordHash,
    roleId: adminRoleId,
    status: "active",
  }).onConflictDoNothing().execute();

  console.log("Seed complete! Admin: info@topperscoachingcenter.com / Admin@123");
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });