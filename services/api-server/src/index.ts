import { env } from "./lib/env";
import app from "./app";
import { logger } from "./lib/logger";
import { getQueueService } from "./lib/queue";
import { initializeJobProcessors } from "./lib/job-processors";
import { getAutomationScheduler } from "./lib/automation-scheduler";

const SCHEDULER_DISABLED = env.NODE_ENV === "development" && !env.ENABLE_AUTOMATION;

const port = env.PORT;
logger.info({ databaseUrl: env.DATABASE_URL }, "DATABASE_URL loaded by environment");

/**
 * SECURITY FIX:
 * Required for rate limiting + proxy headers + CSRF stability in local dev
 */
app.set("trust proxy", 1);

/**
 * Global error handlers — prevent unhandled errors from crashing the process
 * (e.g. Redis SocketClosedUnexpectedlyError, network timeouts)
 */
process.on("uncaughtException", (error) => {
  logger.error({ error }, "Uncaught exception — process continuing");
});
process.on("unhandledRejection", (reason) => {
  logger.error({ reason }, "Unhandled promise rejection — process continuing");
});

/**
 * Initialize background job infrastructure
 */
async function initializeBackgroundJobs() {
  const queueService = getQueueService();

  try {
    const queueReady = await queueService.initialize();

    if (!queueReady) {
      logger.warn(
        { redisUrl: env.REDIS_URL },
        "Background jobs disabled (Redis not available)"
      );
      return;
    }

    await initializeJobProcessors();

    // Start automation scheduler for fee cycles, overdue reminders, etc.
    if (!SCHEDULER_DISABLED) {
      const scheduler = getAutomationScheduler();
      scheduler.start();
      logger.info("Automation scheduler started");
    }

    logger.info("Background job infrastructure initialized");
  } catch (error) {
    logger.warn(
      { error },
      "Background job initialization failed; continuing in degraded mode"
    );
  }
}

/**
 * Start server
 */
async function start() {
  try {
    await initializeBackgroundJobs();

    const server = app.listen(port, () => {
      logger.info({ port }, "Server listening");
    });

    /**
     * Graceful shutdown
     */
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);

      try {
        const queueService = getQueueService();
        await queueService.shutdown();
      } catch {}

      server.close(() => {
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
}

start();