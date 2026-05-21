import { db, permissionsTable, rolesTable } from "@toppers/db";
import { asc, eq } from "drizzle-orm";

export const rbacRepository = {
  async listRoles() {
    return db.query.rolesTable.findMany({
      orderBy: [asc(rolesTable.id)],
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  },

  async listPermissions() {
    return db.select().from(permissionsTable).orderBy(asc(permissionsTable.id));
  },

  async findRoleByName(name: string) {
    return db.query.rolesTable.findFirst({
      where: eq(rolesTable.name, name),
      with: {
        rolePermissions: {
          with: {
            permission: true,
          },
        },
      },
    });
  },
};
