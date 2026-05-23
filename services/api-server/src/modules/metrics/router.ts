/**
 * Metrics Endpoint Router
 * Exposes Prometheus-compatible metrics
 */

import { Router, Request, Response } from "express";
import { getMetrics } from "../../lib/metrics";

const router = Router();

/**
 * GET /metrics
 * Returns Prometheus metrics
 */
router.get("/metrics", async (req: Request, res: Response) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.send(await getMetrics());
});

export default router;
