/**
 * Analytics Aggregation Service
 * Manages async analytics computation and caching
 * Prevents expensive computations during request lifecycle
 */

import { getQueueService, JobType, JobPayload } from "./queue";
import { logger } from "./logger";
import Redis from "ioredis";
import { env } from "./env";
import { v4 as uuidv4 } from "uuid";

/**
 * Analytics Payload for background processing
 */
export interface AnalyticsPayload extends JobPayload {
  type: "daily" | "monthly";
  date?: string;
  classId?: string;
  aggregationType: "attendance" | "fees" | "engagement" | "all";
}

/**
 * Cached Analytics Result
 */
export interface AnalyticsSnapshot {
  id: string;
  type: "daily" | "monthly";
  date: string;
  classId?: string;
  data: Record<string, any>;
  generatedAt: string;
  expiresAt: string;
}

/**
 * Analytics Aggregation Service
 */
export class AnalyticsService {
  private queueService = getQueueService();
  private redis: Redis | null = null;
  private cachePrefix = "analytics:";
  private cacheTTL = 86400; // 24 hours

  private createRedisClient(): Redis {
    if (!this.redis) {
      this.redis = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      this.redis.on("error", (error) => {
        logger.warn({ error }, "Redis cache client error");
      });
    }
    return this.redis;
  }

  private async ensureRedisClient(): Promise<Redis | null> {
    const redis = this.createRedisClient();

    try {
      if (redis.status !== "ready") {
        await redis.connect();
      }
      return redis;
    } catch (error) {
      logger.warn(
        { error, cachePrefix: this.cachePrefix },
        "Redis cache unavailable; analytics cache disabled",
      );
      this.redis = null;
      return null;
    }
  }

  /**
   * Schedule daily analytics aggregation
   */
  async scheduleDailyAggregation(): Promise<string> {
    const payload: AnalyticsPayload = {
      correlationId: uuidv4(),
      userId: "system",
      timestamp: new Date().toISOString(),
      type: "daily",
      date: new Date().toISOString().split("T")[0],
      aggregationType: "all",
    };

    const jobId = await this.queueService.enqueue(
      JobType.AGGREGATE_DAILY_ANALYTICS,
      payload,
    );

    logger.info({ jobId }, "Daily analytics aggregation scheduled");
    return jobId;
  }

  /**
   * Schedule monthly analytics aggregation
   */
  async scheduleMonthlyAggregation(month?: string, year?: number): Promise<string> {
    const now = new Date();
    const aggMonth = month || (now.getMonth() + 1).toString().padStart(2, "0");
    const aggYear = year || now.getFullYear();

    const payload: AnalyticsPayload = {
      correlationId: uuidv4(),
      userId: "system",
      timestamp: new Date().toISOString(),
      type: "monthly",
      date: `${aggYear}-${aggMonth}`,
      aggregationType: "all",
    };

    const jobId = await this.queueService.enqueue(
      JobType.AGGREGATE_MONTHLY_ANALYTICS,
      payload,
    );

    logger.info({ jobId, month: aggMonth, year: aggYear }, "Monthly analytics aggregation scheduled");
    return jobId;
  }

  /**
   * Get cached analytics (read from cache, don't compute)
   */
  async getCachedAnalytics(
    type: "daily" | "monthly",
    date: string,
    classId?: string,
  ): Promise<AnalyticsSnapshot | null> {
    const cacheKey = this.buildCacheKey(type, date, classId);
    const redis = await this.ensureRedisClient();

    if (!redis) {
      return null;
    }

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logger.debug({ cacheKey }, "Analytics cache hit");
        return JSON.parse(cached);
      }
    } catch (error) {
      logger.warn({ error, cacheKey }, "Failed to retrieve cached analytics");
    }

    return null;
  }

  /**
   * Cache analytics result
   */
  async cacheAnalytics(snapshot: AnalyticsSnapshot): Promise<void> {
    const cacheKey = this.buildCacheKey(snapshot.type, snapshot.date, snapshot.classId);
    const redis = await this.ensureRedisClient();

    if (!redis) {
      return;
    }

    try {
      await redis.setex(
        cacheKey,
        this.cacheTTL,
        JSON.stringify(snapshot),
      );
      logger.debug({ cacheKey }, "Analytics cached");
    } catch (error) {
      logger.warn({ error, cacheKey }, "Failed to cache analytics");
    }
  }

  /**
   * Invalidate analytics cache
   */
  async invalidateAnalytics(
    type: "daily" | "monthly",
    date: string,
    classId?: string,
  ): Promise<void> {
    const cacheKey = this.buildCacheKey(type, date, classId);
    const redis = await this.ensureRedisClient();

    if (!redis) {
      return;
    }

    try {
      await redis.del(cacheKey);
      logger.info({ cacheKey }, "Analytics cache invalidated");
    } catch (error) {
      logger.warn({ error, cacheKey }, "Failed to invalidate analytics cache");
    }
  }

  /**
   * Queue risk score update
   */
  async queueRiskScoreUpdate(studentIds?: string[]): Promise<string> {
    const payload: AnalyticsPayload = {
      correlationId: uuidv4(),
      userId: "system",
      timestamp: new Date().toISOString(),
      type: "daily",
      aggregationType: "engagement",
    };

    const jobId = await this.queueService.enqueue(
      JobType.UPDATE_RISK_SCORES,
      payload,
    );

    logger.info({ jobId, studentCount: studentIds?.length }, "Risk score update queued");
    return jobId;
  }

  /**
   * Build cache key
   */
  private buildCacheKey(type: string, date: string, classId?: string): string {
    return `${this.cachePrefix}${type}:${date}${classId ? `:${classId}` : ""}`;
  }

  /**
   * Cleanup resources
   */
  async shutdown(): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.quit();
    } catch (error) {
      logger.warn({ error }, "Analytics Redis shutdown failed");
    }
  }
}

// Singleton instance
let analyticsServiceInstance: AnalyticsService | null = null;

export function getAnalyticsService(): AnalyticsService {
  if (!analyticsServiceInstance) {
    analyticsServiceInstance = new AnalyticsService();
  }
  return analyticsServiceInstance;
}
