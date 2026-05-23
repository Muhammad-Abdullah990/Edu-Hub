import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const serviceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const workspaceRoot = path.resolve(serviceRoot, "../..");

// In non-production, let repo .env files override stale machine-level vars (e.g. wrong DATABASE_URL).
const overrideEnvFiles = process.env.NODE_ENV !== "production";

dotenv.config({
  path: path.resolve(workspaceRoot, ".env"),
  override: overrideEnvFiles,
});
dotenv.config({
  path: path.resolve(serviceRoot, ".env"),
  override: overrideEnvFiles,
});
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
  override: overrideEnvFiles,
});

/**
 * Environment Schema (DEV SAFE + PRODUCTION READY)
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),

  PORT: z.string().pipe(z.coerce.number().positive()).default("3001"),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  DATABASE_URL: z.string().url(),

  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  /**
   * JWT (DEV SAFE DEFAULTS)
   * - relaxed ONLY for local development
   */
  JWT_ACCESS_SECRET: z.string().min(16).default("dev_access_secret_1234567890123456"),
  JWT_REFRESH_SECRET: z.string().min(16).default("dev_refresh_secret_1234567890123456"),

  JWT_ACCESS_EXPIRY: z.string().default("1h"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  /**
   * CORS FIX for frontend at 4173
   */
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:4173")
    .transform((v) => v.split(",").map((s) => s.trim())),

  RATE_LIMIT_WINDOW_MS: z.string().pipe(z.coerce.number()).default("900000"),
  RATE_LIMIT_MAX_REQUESTS: z.string().pipe(z.coerce.number()).default("100"),

  WHATSAPP_PHONE: z.string().optional(),
  WHATSAPP_API_URL: z.string().url().optional(),

  PDF_TIMEOUT: z.string().pipe(z.coerce.number()).default("30000"),
  PDF_FORMAT: z.string().default("A4"),

  AUTOMATION_LOG_DIR: z.string().default("./logs"),
  AUTOMATION_REPORT_DIR: z.string().default("./reports"),

  FRONTEND_ORIGIN: z.string().url().default("http://localhost:4173").optional(),

  ENABLE_ANALYTICS: z.string().transform((v) => v === "true").default("true"),
  ENABLE_AUTOMATION: z.string().transform((v) => v === "true").default("true"),
  ENABLE_AI_FEATURES: z.string().transform((v) => v === "true").default("false"),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().transform((v) => v === "true").default("false"),

  SENTRY_DSN: z.string().url().optional(),
  DATADOG_API_KEY: z.string().optional(),
});

/**
 * Validate environment
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("\n");

    throw new Error(`Invalid environment configuration:\n${errors}`);
  }

  return result.data;
}

export const env = validateEnv();

export const isProduction = env.NODE_ENV === "production";
export const isStaging = env.NODE_ENV === "staging";
export const isDevelopment = env.NODE_ENV === "development";