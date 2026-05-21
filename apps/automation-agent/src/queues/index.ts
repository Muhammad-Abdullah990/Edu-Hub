import { v4 as uuidv4 } from "uuid";
import { automationDb } from "../db";
import { QueueJobPayloadSchema, type QueueJobPayload } from "../validation";
import type { QueueItem, AutomationJob } from "../types";
import logger from "../logging";

export class QueueService {
  private processing = false;

  async enqueue(payload: QueueJobPayload): Promise<AutomationJob> {
    try {
      // Validate payload
      const validatedPayload = QueueJobPayloadSchema.parse(payload);

      // Create job
      const job = await automationDb.createJob({
        eventType: validatedPayload.eventType,
        status: "pending",
        payload: validatedPayload.payload,
        createdBy: "system", // System-generated jobs
      });

      logger.info({ jobId: job.id, eventType: job.eventType }, "Job enqueued");

      return job;
    } catch (error) {
      logger.error({ error, payload }, "Failed to enqueue job");
      throw error;
    }
  }

  async dequeue(): Promise<AutomationJob | null> {
    try {
      const jobs = await automationDb.getPendingJobs(1);
      return jobs[0] || null;
    } catch (error) {
      logger.error({ error }, "Failed to dequeue job");
      throw error;
    }
  }

  async markJobProcessing(jobId: string): Promise<void> {
    await automationDb.updateJobStatus(jobId, "generating");
  }

  async markJobReady(jobId: string): Promise<void> {
    await automationDb.updateJobStatus(jobId, "ready");
  }

  async markJobFailed(jobId: string, errorMessage?: string): Promise<void> {
    await automationDb.updateJobStatus(jobId, "failed", {
      errorMessage,
    });
  }

  async markJobAwaitingManualSend(jobId: string): Promise<void> {
    await automationDb.updateJobStatus(jobId, "awaiting_manual_send");
  }

  async markJobCompleted(jobId: string): Promise<void> {
    await automationDb.updateJobStatus(jobId, "completed");
  }

  async getJobById(jobId: string): Promise<AutomationJob | null> {
    return await automationDb.getJobById(jobId);
  }

  async incrementRetryCount(jobId: string): Promise<AutomationJob | null> {
    return automationDb.incrementRetryCount(jobId);
  }

  async processQueue(): Promise<void> {
    if (this.processing) {
      logger.debug("Queue processing already in progress");
      return;
    }

    this.processing = true;

    try {
      let job = await this.dequeue();

      while (job) {
        logger.info({ jobId: job.id, eventType: job.eventType }, "Processing job");

        try {
          await this.markJobProcessing(job.id);

          // Process the job (this will be implemented in workflows)
          await this.processJob(job);

          await this.markJobCompleted(job.id);
          logger.info({ jobId: job.id }, "Job completed successfully");

        } catch (error) {
          logger.error({ error, jobId: job.id }, "Job processing failed");

          const updatedJob = await this.incrementRetryCount(job.id);
          if (updatedJob && updatedJob.retryCount >= 3) {
            await this.markJobFailed(job.id, error instanceof Error ? error.message : "Unknown error");
          } else {
            // Reset to pending for retry
            await automationDb.updateJobStatus(job.id, "pending");
          }
        }

        job = await this.dequeue();
      }

    } finally {
      this.processing = false;
    }
  }

  private async processJob(job: AutomationJob): Promise<void> {
    const { workflowService } = await import("../workflows");

    switch (job.eventType) {
      case "MONTHLY_REPORT_READY":
        await workflowService.processMonthlyReportReady(job);
        break;
      case "FEE_REMINDER_DUE":
        await workflowService.processFeeReminderDue(job);
        break;
      case "ATTENDANCE_ALERT":
        await workflowService.processAttendanceAlert(job);
        break;
      case "PERFORMANCE_ALERT":
        await workflowService.processPerformanceAlert(job);
        break;
      case "CUSTOM_PARENT_NOTIFICATION":
        await workflowService.processCustomParentNotification(job);
        break;
      default:
        throw new Error(`Unknown event type: ${job.eventType}`);
    }
  }

  async getQueueStats(): Promise<{
    pending: number;
    processing: number;
    ready: number;
    failed: number;
    awaiting_manual_send: number;
    completed: number;
  }> {
    // This would require additional DB queries to count by status
    // For now, return placeholder
    return {
      pending: 0,
      processing: 0,
      ready: 0,
      failed: 0,
      awaiting_manual_send: 0,
      completed: 0,
    };
  }
}

export const queueService = new QueueService();