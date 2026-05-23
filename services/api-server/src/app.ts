import { env } from "./lib/env";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { correlationIdMiddleware, globalErrorHandler, notFoundHandler } from "./lib/error-handler";
import { sanitizeRequest } from "./middlewares/sanitize-request";
import { metricsMiddleware, initializeMetrics } from "./lib/metrics";

const app: Express = express();

app.set("trust proxy", true);

// Initialize metrics
initializeMetrics();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

// Logging middleware
app.use(
  pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => {
        // Skip logging for health checks and metrics endpoints
        return req.url.includes("/health") || req.url.includes("/metrics");
      },
    },
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
          correlationId: (req as any).correlationId,
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Correlation ID for request tracing
app.use(correlationIdMiddleware);

// Metrics collection
app.use(metricsMiddleware);

// CORS configuration
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Body parsing
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request sanitization
app.use(sanitizeRequest);

// API routes
app.use("/api", router);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;

