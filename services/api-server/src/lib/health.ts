import { db, pool } from "@toppers/db";
import { createClient } from "redis";
import fs from "fs/promises";
import { logger } from "./logger";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
}

export interface HealthCheckResult {
  status: "ok" | "warning" | "error";
  message?: string;
  latency?: number;
  details?: Record<string, unknown>;
}

/**
 * Database Health Check
 */
export async function checkDatabase(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  try {
    // Simple query to verify connection using pg pool directly
    await pool.query("SELECT 1");
    const latency = Date.now() - startTime;
    return {
      status: "ok",
      message: "Database connection healthy",
      latency,
    };
  } catch (error) {
    logger.error({ error }, "Database health check failed");
    // Ensure raw error and underlying cause are visible in console during debugging
    // (temporary) - will help capture driver-specific messages
    // eslint-disable-next-line no-console
    console.error("Database health check error:", error);
    // eslint-disable-next-line no-console
    console.error("Database health check error cause:", (error && (error as any).cause) || null);
    return {
      status: "error",
      message: `Database connection failed: ${error instanceof Error ? error.message : "unknown"}`,
      details: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

/**
 * Redis Health Check
 */
export async function checkRedis(): Promise<HealthCheckResult> {
  const startTime = Date.now();

  // Check if the queue service already has a working Redis connection
  const { getQueueService } = await import("./queue");
  const queueService = getQueueService();
  if (queueService.isEnabled()) {
    return {
      status: "ok",
      message: "Redis connection healthy (via queue service)",
      latency: Date.now() - startTime,
    };
  }

  // If queue is disabled, Redis is unreachable — report warning without creating a new client
  // Creating standalone redis clients causes SocketClosedUnexpectedlyError crashes
  return {
    status: "warning",
    message: "Redis not connected (background jobs disabled)",
    latency: Date.now() - startTime,
  };
}

/**
 * Filesystem Health Check
 */
export async function checkFilesystem(): Promise<HealthCheckResult> {
  try {
    const dirs = [
      process.env.AUTOMATION_LOG_DIR || "./storage/logs",
      process.env.AUTOMATION_REPORT_DIR || "./storage/reports",
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        // Try to create directory if it doesn't exist
        await fs.mkdir(dir, { recursive: true });
      }
    }

    return {
      status: "ok",
      message: "Filesystem accessible",
    };
  } catch (error) {
    logger.error({ error }, "Filesystem health check failed");
    return {
      status: "warning",
      message: `Filesystem check failed: ${error instanceof Error ? error.message : "unknown"}`,
    };
  }
}

/**
 * Process Health Check
 */
export function checkProcess(): HealthCheckResult {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  return {
    status: "ok",
    message: "Process healthy",
    details: {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
    },
  };
}

/**
 * Perform all health checks
 */
export async function performHealthChecks(): Promise<HealthStatus> {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    filesystem: await checkFilesystem(),
    process: checkProcess(),
  };

  // Determine overall status
  const statuses = Object.values(checks).map((c) => c.status);
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  if (statuses.includes("error")) {
    overallStatus = "unhealthy";
  } else if (statuses.includes("warning")) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
  };
}

/**
 * Readiness Check - All critical services must be healthy
 */
export async function isReady(): Promise<boolean> {
  const health = await performHealthChecks();
  // Only consider system ready if database is healthy
  return health.checks.database.status === "ok";
}

/**
 * Liveness Check - Process is running
 */
export function isAlive(): boolean {
  return process.uptime() > 0;
}
