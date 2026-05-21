import { queueService } from "../queues";
import { workflowService } from "../workflows";
import { schedulerService } from "../scheduler";
import { pdfGenerator } from "../pdf";
import { whatsAppService } from "../whatsapp";
import { storageService } from "../storage";
import logger from "../logging";

export class AutomationCore {
  private running = false;

  async start(): Promise<void> {
    if (this.running) {
      logger.warn("Automation core already running");
      return;
    }

    logger.info("Starting automation core");

    try {
      // Initialize services
      await pdfGenerator.initialize();
      await whatsAppService.initialize();

      // Start scheduler
      await schedulerService.start();

      // Start queue processing
      this.startQueueProcessing();

      this.running = true;
      logger.info("Automation core started successfully");

    } catch (error) {
      logger.error({ error }, "Failed to start automation core");
      await this.stop();
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    logger.info("Stopping automation core");

    try {
      // Stop scheduler
      await schedulerService.stop();

      // Close services
      await pdfGenerator.close();
      await whatsAppService.close();

      this.running = false;
      logger.info("Automation core stopped successfully");

    } catch (error) {
      logger.error({ error }, "Error stopping automation core");
      throw error;
    }
  }

  private startQueueProcessing(): void {
    // Process queue every 30 seconds
    const interval = setInterval(async () => {
      try {
        await queueService.processQueue();
      } catch (error) {
        logger.error({ error }, "Queue processing failed");
      }
    }, 30000);

    // Store interval for cleanup
    (this as any).queueInterval = interval;
  }

  async processJob(jobId: string): Promise<void> {
    const job = await queueService.getJobById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    await workflowService.processJob(job);
  }

  async executeWhatsAppDraft(draftId: string): Promise<void> {
    await workflowService.executeWhatsAppDraft(draftId);
  }

  async getSystemStatus(): Promise<{
    running: boolean;
    queueStats: any;
    schedulerActive: boolean;
    services: {
      pdf: boolean;
      whatsapp: boolean;
      storage: boolean;
    };
  }> {
    return {
      running: this.running,
      queueStats: await queueService.getQueueStats(),
      schedulerActive: true, // Would check actual scheduler status
      services: {
        pdf: true, // Would check actual service status
        whatsapp: await whatsAppService.isLoggedIn(),
        storage: true, // Would check storage availability
      },
    };
  }

  async cleanup(): Promise<void> {
    logger.info("Running cleanup tasks");

    // Clean temp files older than 24 hours
    await storageService.cleanTempFiles(24);

    logger.info("Cleanup completed");
  }
}

export const automationCore = new AutomationCore();