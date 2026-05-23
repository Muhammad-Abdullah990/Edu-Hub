/**
 * Metrics Collection & Monitoring
 * Provides Prometheus-compatible metrics for operational visibility
 */

import { register, Counter, Histogram, Gauge } from "prom-client";
import { logger } from "./logger";

/**
 * Request metrics
 */
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const httpRequestCount = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

export const httpRequestErrors = new Counter({
  name: "http_request_errors_total",
  help: "Total number of HTTP request errors",
  labelNames: ["method", "route", "error_code"],
});

/**
 * Database metrics
 */
export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "Duration of database queries in seconds",
  labelNames: ["operation", "table"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
});

export const dbConnectionPoolSize = new Gauge({
  name: "db_connection_pool_size",
  help: "Number of active database connections",
});

/**
 * Queue metrics
 */
export const jobQueueSize = new Gauge({
  name: "job_queue_size",
  help: "Number of jobs in queue",
  labelNames: ["queue_type"],
});

export const jobProcessingDuration = new Histogram({
  name: "job_processing_duration_seconds",
  help: "Duration of job processing in seconds",
  labelNames: ["job_type"],
  buckets: [1, 5, 10, 30, 60, 300],
});

export const jobFailureCount = new Counter({
  name: "job_failures_total",
  help: "Total number of job failures",
  labelNames: ["job_type", "reason"],
});

/**
 * PDF Generation metrics
 */
export const pdfGenerationDuration = new Histogram({
  name: "pdf_generation_duration_seconds",
  help: "Duration of PDF generation in seconds",
  labelNames: ["report_type"],
  buckets: [1, 5, 10, 30, 60],
});

export const pdfGenerationErrors = new Counter({
  name: "pdf_generation_errors_total",
  help: "Total number of PDF generation errors",
  labelNames: ["report_type", "reason"],
});

/**
 * Analytics metrics
 */
export const analyticsAggregationDuration = new Histogram({
  name: "analytics_aggregation_duration_seconds",
  help: "Duration of analytics aggregation in seconds",
  labelNames: ["aggregation_type"],
  buckets: [5, 10, 30, 60, 300],
});

export const analyticsCacheHits = new Counter({
  name: "analytics_cache_hits_total",
  help: "Total number of analytics cache hits",
  labelNames: ["analytics_type"],
});

export const analyticsCacheMisses = new Counter({
  name: "analytics_cache_misses_total",
  help: "Total number of analytics cache misses",
  labelNames: ["analytics_type"],
});

/**
 * Automation metrics
 */
export const automationWorkflowDuration = new Histogram({
  name: "automation_workflow_duration_seconds",
  help: "Duration of automation workflows in seconds",
  labelNames: ["workflow_type"],
  buckets: [5, 10, 30, 60, 300],
});

export const automationWorkflowCount = new Counter({
  name: "automation_workflows_total",
  help: "Total number of automation workflows",
  labelNames: ["workflow_type", "status"],
});

/**
 * Memory metrics
 */
export const processMemoryUsage = new Gauge({
  name: "process_memory_usage_bytes",
  help: "Process memory usage in bytes",
  labelNames: ["type"],
});

/**
 * Initialize metrics collection
 */
export function initializeMetrics(): void {
  logger.info("Metrics infrastructure initialized");
}

/**
 * Get Prometheus metrics
 */
export async function getMetrics(): Promise<string> {
  return register.metrics();
}

/**
 * Record metrics middleware
 */
export function metricsMiddleware(req: any, res: any, next: any) {
  const startTime = Date.now();
  const route = req.route?.path || req.path;
  const method = req.method;

  res.on("finish", () => {
    const duration = (Date.now() - startTime) / 1000;
    const status = res.statusCode;

    httpRequestDuration.labels(method, route, status).observe(duration);
    httpRequestCount.labels(method, route, status).inc();

    if (status >= 400) {
      httpRequestErrors.labels(method, route, status).inc();
    }

    // Update memory metrics
    const memUsage = process.memoryUsage();
    processMemoryUsage.labels("heap_used").set(memUsage.heapUsed);
    processMemoryUsage.labels("heap_total").set(memUsage.heapTotal);
    processMemoryUsage.labels("external").set(memUsage.external);
  });

  next();
}
