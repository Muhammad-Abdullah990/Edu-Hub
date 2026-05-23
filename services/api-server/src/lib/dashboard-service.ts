/**
 * Operational Dashboard Service
 * Provides real-time system health and operational metrics
 */

import { getQueueService, JobType } from "./queue";
import { getAnalyticsService } from "./analytics-service";
import { getAutomationService } from "./automation-service";
import { performHealthChecks } from "./health";
import { logger } from "./logger";

/**
 * Dashboard Status
 */
export interface DashboardStatus {
  timestamp: string;
  systemHealth: any;
  queues: QueueStatus[];
  automation: AutomationStatus;
  analytics: AnalyticsStatus;
  performance: PerformanceMetrics;
}

export interface QueueStatus {
  queueType: string;
  size: number;
  processing: number;
  failed: number;
  delayed: number;
}

export interface AutomationStatus {
  pendingWorkflows: number;
  totalWorkflows: number;
  lastUpdate: string;
}

export interface AnalyticsStatus {
  lastDailyAggregation?: string;
  lastMonthlyAggregation?: string;
  cacheHits: number;
  cacheMisses: number;
}

export interface PerformanceMetrics {
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
  };
  cpu: {
    user: number;
    system: number;
  };
}

/**
 * Dashboard Service
 */
export class DashboardService {
  async getStatus(): Promise<DashboardStatus> {
    try {
      const systemHealth = await performHealthChecks();
      const automationService = getAutomationService();
      const pendingWorkflows = automationService.getPendingWorkflows();

      return {
        timestamp: new Date().toISOString(),
        systemHealth,
        queues: await this.getQueueStatus(),
        automation: {
          pendingWorkflows: pendingWorkflows.length,
          totalWorkflows: automationService.getRecentWorkflows().length,
          lastUpdate: new Date().toISOString(),
        },
        analytics: {
          cacheHits: 0, // TODO: Implement cache hit tracking
          cacheMisses: 0, // TODO: Implement cache miss tracking
        },
        performance: {
          uptime: process.uptime(),
          memory: {
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
          cpu: {
            user: process.cpuUsage().user,
            system: process.cpuUsage().system,
          },
        },
      };
    } catch (error) {
      logger.error({ error }, "Failed to get dashboard status");
      throw error;
    }
  }

  private async getQueueStatus(): Promise<QueueStatus[]> {
    // TODO: Implement queue status retrieval
    return [];
  }
}

// Singleton instance
let dashboardServiceInstance: DashboardService | null = null;

export function getDashboardService(): DashboardService {
  if (!dashboardServiceInstance) {
    dashboardServiceInstance = new DashboardService();
  }
  return dashboardServiceInstance;
}
