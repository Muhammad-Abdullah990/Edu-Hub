#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { automationCore } from "./core";
import { eventService } from "./events";
import logger from "./logging";
import automationConfig from "./config";

async function main() {
  logger.info("Starting Edu-Hub Automation Agent");

  try {
    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      logger.info("Received SIGINT, shutting down gracefully");
      await automationCore.stop();
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      logger.info("Received SIGTERM, shutting down gracefully");
      await automationCore.stop();
      process.exit(0);
    });

    // Start the automation system
    await automationCore.start();

    // Run cleanup every hour
    setInterval(async () => {
      try {
        await automationCore.cleanup();
      } catch (error) {
        logger.error({ error }, "Cleanup failed");
      }
    }, 60 * 60 * 1000);

    logger.info("Automation agent is running");

    // Keep the process alive
    await new Promise(() => {}); // Never resolves

  } catch (error) {
    logger.error({ error }, "Failed to start automation agent");
    await automationCore.stop();
    process.exit(1);
  }
}

// Export services for external use (e.g., API integration)
export { automationCore } from "./core";
export { eventService } from "./events";
export { queueService } from "./queues";
export { workflowService } from "./workflows";
export { schedulerService } from "./scheduler";
export { pdfGenerator } from "./pdf";
export { whatsAppService } from "./whatsapp";
export { storageService } from "./storage";
export { automationDb } from "./db";
export { logger } from "./logging";

// Run main only when this module is the direct process entrypoint.
const isEntrypoint =
  typeof process.argv[1] === "string" &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntrypoint) {
  main();
}
