/**
 * Background Job Queue Infrastructure
 * Provides async job processing for resource-intensive operations
 */

import { Queue, Worker, QueueEvents } from "bullmq";
import Redis from "ioredis";
import { logger } from "./logger";
import { env } from "./env";

/**
 * Job Types for different background processing workflows
 */
export enum JobType {
  // PDF Generation
  GENERATE_MONTHLY_REPORT = "generate-monthly-report",
  GENERATE_ATTENDANCE_REPORT = "generate-attendance-report",
  GENERATE_FEE_REPORT = "generate-fee-report",

  // Analytics
  AGGREGATE_DAILY_ANALYTICS = "aggregate-daily-analytics",
  AGGREGATE_MONTHLY_ANALYTICS = "aggregate-monthly-analytics",
  UPDATE_RISK_SCORES = "update-risk-scores",

  // Automation & Communication
  PREPARE_WHATSAPP_COMMUNICATION = "prepare-whatsapp-communication",
  SEND_BATCH_COMMUNICATIONS = "send-batch-communications",
  EXECUTE_AUTOMATION_WORKFLOW = "execute-automation-workflow",

  // Notifications
  SEND_EMAIL_NOTIFICATION = "send-email-notification",
  SEND_SMS_NOTIFICATION = "send-sms-notification",

  // Data Processing
  SYNC_EXTERNAL_DATA = "sync-external-data",
  CLEANUP_OLD_FILES = "cleanup-old-files",
}

/**
 * Generic job payload structure
 */
export interface JobPayload {
  correlationId: string;
  userId: string;
  timestamp: string;
  [key: string]: any;
}

/**
 * Job retry configuration
 */
export interface JobRetryConfig {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: JobRetryConfig = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 30000,
};

/**
 * Queue Service - Manages job enqueueing and processing
 */
export class QueueService {
  private queues: Map<JobType, Queue> = new Map();
  private workers: Map<JobType, Worker> = new Map();
  private queueEvents: Map<JobType, QueueEvents> = new Map();
  private redis: Redis | null = null;
  private enabled = false;
  private initialized = false;

  constructor() {
    // Delay Redis connection until initialization so the server can start in degraded mode.
  }

  private createRedisClient(): Redis {
    if (!this.redis) {
      this.redis = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      this.redis.on("error", (error) => {
        logger.warn({ error }, "Redis connection error");
      });
    }
    return this.redis;
  }

  /**
   * Initialize queue infrastructure
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.enabled;
    }

    this.initialized = true;
    logger.info("Initializing queue infrastructure");

    const redis = this.createRedisClient();
    try {
      await redis.connect();
      this.enabled = true;
      logger.info({ redisUrl: env.REDIS_URL }, "Connected to Redis for queue infrastructure");
    } catch (error) {
      this.enabled = false;
      logger.warn(
        { error, redisUrl: env.REDIS_URL },
        "Redis unavailable; queue infrastructure will remain disabled",
      );

      try {
        await redis.disconnect();
      } catch {
        // Ignore disconnect errors when the client never connected.
      }
      this.redis = null;
      return false;
    }

    for (const jobType of Object.values(JobType)) {
      await this.setupQueue(jobType);
    }

    logger.info("Queue infrastructure initialized");
    return true;
  }

  /**
   * Setup individual queue with worker
   */
  private async setupQueue(jobType: JobType): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    const queue = new Queue(jobType, { connection: this.redis });
    const queueEvents = new QueueEvents(jobType, { connection: this.redis });

    // Monitor queue events
    queueEvents.on("completed", ({ jobId }) => {
      logger.debug({ jobType, jobId }, "Job completed");
    });

    queueEvents.on("failed", ({ jobId, failedReason }) => {
      logger.warn({ jobType, jobId, failedReason }, "Job failed");
    });

    this.queues.set(jobType, queue);
    this.queueEvents.set(jobType, queueEvents);
  }

  private assertEnabled(operation: string): void {
    if (!this.enabled) {
      throw new Error(`Queue service unavailable; cannot ${operation} when Redis is offline`);
    }
  }

  /**
   * Enqueue a job for background processing
   */
  async enqueue<T extends JobPayload>(
    jobType: JobType,
    payload: T,
    retryConfig: JobRetryConfig = DEFAULT_RETRY_CONFIG,
  ): Promise<string> {
    this.assertEnabled("enqueue jobs");

    const queue = this.queues.get(jobType);
    if (!queue) {
      throw new Error(`Queue not configured for job type: ${jobType}`);
    }

    try {
      const job = await queue.add(jobType, payload, {
        attempts: retryConfig.maxAttempts,
        backoff: {
          type: "exponential",
          delay: retryConfig.delayMs,
        },
        removeOnComplete: true,
        removeOnFail: false,
      });

      logger.info(
        { jobType, jobId: job.id, correlationId: payload.correlationId },
        "Job enqueued",
      );

      return job.id!;
    } catch (error) {
      logger.error(
        { error, jobType, correlationId: payload.correlationId },
        "Failed to enqueue job",
      );
      throw error;
    }
  }

  /**
   * Register job processor
   */
  registerProcessor<T extends JobPayload>(
    jobType: JobType,
    processor: (payload: T) => Promise<any>,
  ): void {
    if (!this.enabled || !this.redis) {
      logger.warn(
        { jobType },
        "Skipping processor registration because queue infrastructure is disabled",
      );
      return;
    }

    const worker = new Worker(
      jobType,
      async (job) => {
        try {
          logger.info(
            { jobType, jobId: job.id, correlationId: job.data.correlationId },
            "Processing job",
          );

          const result = await processor(job.data);

          logger.info(
            { jobType, jobId: job.id, correlationId: job.data.correlationId },
            "Job processed successfully",
          );

          return result;
        } catch (error) {
          logger.error(
            {
              error,
              jobType,
              jobId: job.id,
              correlationId: job.data.correlationId,
              attempt: job.attemptsMade,
            },
            "Job processing failed",
          );
          throw error;
        }
      },
      { connection: this.redis, concurrency: 5 },
    );

    worker.on("failed", (job, error) => {
      if (!job) {
        logger.error(
          { error, jobType },
          "Job failed permanently but job metadata is unavailable",
        );
        return;
      }

      if (job.attemptsMade === job.opts.attempts) {
        logger.error(
          {
            error,
            jobType,
            jobId: job.id,
            correlationId: job.data.correlationId,
          },
          "Job failed permanently - moving to dead-letter",
        );
      }
    });

    this.workers.set(jobType, worker);
  }

  /**
   * Get job status
   */
  async getJobStatus(jobType: JobType, jobId: string) {
    if (!this.enabled) {
      return null;
    }

    const queue = this.queues.get(jobType);
    if (!queue) {
      throw new Error(`Queue not configured for job type: ${jobType}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      return null;
    }

    const currentJob = job;
    const progress =
      typeof currentJob.progress === "function"
        ? await currentJob.progress()
        : currentJob.progress;

    return {
      id: currentJob.id,
      state: await currentJob.getState(),
      progress,
      attempts: currentJob.attemptsMade,
      maxAttempts: currentJob.opts.attempts,
      data: currentJob.data,
    };
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    if (!this.redis) {
      logger.info("Queue infrastructure was never initialized; skipping shutdown");
      return;
    }

    logger.info("Shutting down queue infrastructure");

    for (const worker of this.workers.values()) {
      await worker.close();
    }

    for (const queueEvents of this.queueEvents.values()) {
      await queueEvents.close();
    }

    for (const queue of this.queues.values()) {
      await queue.close();
    }

    await this.redis.quit();

    logger.info("Queue infrastructure shut down");
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
let queueServiceInstance: QueueService | null = null;

export function getQueueService(): QueueService {
  if (!queueServiceInstance) {
    queueServiceInstance = new QueueService();
  }
  return queueServiceInstance;
}
