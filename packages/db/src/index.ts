import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(packageRoot, "../..");
const overrideEnvFiles = process.env.NODE_ENV !== "production";

dotenv.config({
  path: path.resolve(workspaceRoot, ".env"),
  override: overrideEnvFiles,
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: overrideEnvFiles,
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL, family: 4 } as any);
export const db = drizzle(pool, { schema });

export * from "./schema";
