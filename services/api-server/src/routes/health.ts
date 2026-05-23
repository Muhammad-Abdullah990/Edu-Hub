import { Router, type IRouter, Request, Response } from "express";
import { performHealthChecks, isReady, isAlive } from "../lib/health";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * GET /health
 * Comprehensive health check with all system status
 */
router.get("/health", async (req, res) => {
  try {
    const health = await performHealthChecks();
    const statusCode = health.status === "healthy" ? 200 : health.status === "degraded" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error({ error }, "Health check failed");
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    });
  }
});

/**
 * GET /healthz
 * Kubernetes liveness probe equivalent
 */
router.get("/healthz", async (req: Request, res: Response) => {
  try {
    const alive = isAlive();
    if (alive) {
      res.status(200).json({ status: "ok" });
    } else {
      res.status(503).json({ status: "unhealthy" });
    }
  } catch (error) {
    logger.error({ error }, "Healthz check failed");
    res.status(503).json({ status: "unhealthy" });
  }
});

/**
 * GET /ready
 * Readiness probe - returns 200 only when system is ready for traffic
 */
router.get("/ready", async (req: Request, res: Response) => {
  try {
    const ready = await isReady();
    if (ready) {
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: "not_ready",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    logger.error({ error }, "Readiness check failed");
    res.status(503).json({
      status: "not_ready",
      timestamp: new Date().toISOString(),
      error: "Readiness check failed",
    });
  }
});

/**
 * GET /live
 * Liveness probe - returns 200 if process is running
 */
router.get("/live", (req: Request, res: Response) => {
  if (isAlive()) {
    res.status(200).json({
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } else {
    res.status(503).json({
      status: "dead",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

