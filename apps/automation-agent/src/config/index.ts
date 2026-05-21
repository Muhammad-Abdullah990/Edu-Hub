import { config } from "dotenv";
import path from "path";
import { AutomationConfigSchema } from "../validation";

config();

const configSchema = AutomationConfigSchema.default({
  storage: {
    basePath: path.join(process.cwd(), "storage"),
    reportsDir: "reports",
    logsDir: "logs",
    draftsDir: "drafts",
    tempDir: "temp",
  },
  whatsapp: {
    webUrl: "https://web.whatsapp.com",
    timeout: 30000,
    retryAttempts: 3,
  },
  pdf: {
    timeout: 30000,
    format: "A4",
    margin: {
      top: "1in",
      right: "1in",
      bottom: "1in",
      left: "1in",
    },
  },
  scheduler: {
    monthlyReportCron: "0 9 1 * *", // 1st of every month at 9 AM
    feeReminderCron: "0 10 * * 1-5", // Every weekday at 10 AM
    attendanceAlertCron: "0 8 * * 1-5", // Every weekday at 8 AM
  },
  logging: {
    level: "info",
    prettyPrint: process.env.NODE_ENV !== "production",
  },
});

export const automationConfig = configSchema.parse({
  storage: {
    basePath: process.env.STORAGE_BASE_PATH || path.join(process.cwd(), "storage"),
    reportsDir: process.env.STORAGE_REPORTS_DIR || "reports",
    logsDir: process.env.STORAGE_LOGS_DIR || "logs",
    draftsDir: process.env.STORAGE_DRAFTS_DIR || "drafts",
    tempDir: process.env.STORAGE_TEMP_DIR || "temp",
  },
  whatsapp: {
    webUrl: process.env.WHATSAPP_WEB_URL || "https://web.whatsapp.com",
    timeout: parseInt(process.env.WHATSAPP_TIMEOUT || "30000"),
    retryAttempts: parseInt(process.env.WHATSAPP_RETRY_ATTEMPTS || "3"),
  },
  pdf: {
    timeout: parseInt(process.env.PDF_TIMEOUT || "30000"),
    format: (process.env.PDF_FORMAT as "A4" | "Letter") || "A4",
    margin: {
      top: process.env.PDF_MARGIN_TOP || "1in",
      right: process.env.PDF_MARGIN_RIGHT || "1in",
      bottom: process.env.PDF_MARGIN_BOTTOM || "1in",
      left: process.env.PDF_MARGIN_LEFT || "1in",
    },
  },
  scheduler: {
    monthlyReportCron: process.env.SCHEDULER_MONTHLY_REPORT_CRON || "0 9 1 * *",
    feeReminderCron: process.env.SCHEDULER_FEE_REMINDER_CRON || "0 10 * * 1-5",
    attendanceAlertCron: process.env.SCHEDULER_ATTENDANCE_ALERT_CRON || "0 8 * * 1-5",
  },
  logging: {
    level: (process.env.LOG_LEVEL as "debug" | "info" | "warn" | "error") || "info",
    prettyPrint: process.env.LOG_PRETTY_PRINT === "true" || process.env.NODE_ENV !== "production",
  },
});

export default automationConfig;