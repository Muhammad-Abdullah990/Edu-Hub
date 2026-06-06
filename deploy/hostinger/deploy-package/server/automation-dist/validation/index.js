import { z } from "zod";
// Re-export types for convenience
export * from "../types";
// Event Payload Validations
export const MonthlyReportReadyPayloadSchema = z.object({
    studentId: z.string().uuid(),
    month: z.string(), // YYYY-MM
    year: z.number().int(),
});
export const FeeReminderDuePayloadSchema = z.object({
    studentId: z.string().uuid(),
    feeRecordId: z.string().uuid(),
    dueDate: z.string(), // ISO date string
    amount: z.number(),
});
export const AttendanceAlertPayloadSchema = z.object({
    studentId: z.string().uuid(),
    attendancePercentage: z.number().min(0).max(100),
    month: z.string(),
});
export const PerformanceAlertPayloadSchema = z.object({
    studentId: z.string().uuid(),
    subject: z.string(),
    grade: z.string(),
    teacherNotes: z.string(),
});
export const CustomParentNotificationPayloadSchema = z.object({
    studentId: z.string().uuid(),
    parentId: z.string().uuid(),
    subject: z.string(),
    message: z.string(),
});
// Queue Payload Validations
export const QueueJobPayloadSchema = z.discriminatedUnion("eventType", [
    z.object({
        eventType: z.literal("MONTHLY_REPORT_READY"),
        payload: MonthlyReportReadyPayloadSchema,
    }),
    z.object({
        eventType: z.literal("FEE_REMINDER_DUE"),
        payload: FeeReminderDuePayloadSchema,
    }),
    z.object({
        eventType: z.literal("ATTENDANCE_ALERT"),
        payload: AttendanceAlertPayloadSchema,
    }),
    z.object({
        eventType: z.literal("PERFORMANCE_ALERT"),
        payload: PerformanceAlertPayloadSchema,
    }),
    z.object({
        eventType: z.literal("CUSTOM_PARENT_NOTIFICATION"),
        payload: CustomParentNotificationPayloadSchema,
    }),
]);
// PDF Template Data Validations
export const MonthlyReportTemplateDataSchema = z.object({
    studentName: z.string(),
    parentName: z.string(),
    attendancePercentage: z.number(),
    teacherNotes: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
    academicProgress: z.record(z.string(), z.unknown()),
    generatedAt: z.string(),
    institutionName: z.string(),
});
export const FeeReminderTemplateDataSchema = z.object({
    studentName: z.string(),
    parentName: z.string(),
    feeAmount: z.number(),
    dueDate: z.string(),
    outstandingAmount: z.number(),
    generatedAt: z.string(),
});
// File Metadata Validation
export const FileMetadataSchema = z.object({
    path: z.string(),
    name: z.string(),
    size: z.number().int().positive(),
    checksum: z.string(),
    mimeType: z.string(),
    createdAt: z.date(),
});
// Configuration Validation
export const AutomationConfigSchema = z.object({
    storage: z.object({
        basePath: z.string(),
        reportsDir: z.string(),
        logsDir: z.string(),
        draftsDir: z.string(),
        tempDir: z.string(),
    }),
    whatsapp: z.object({
        webUrl: z.string().url(),
        timeout: z.number().int().positive(),
        retryAttempts: z.number().int().min(0),
    }),
    pdf: z.object({
        timeout: z.number().int().positive(),
        format: z.enum(["A4", "Letter"]),
        margin: z.object({
            top: z.string(),
            right: z.string(),
            bottom: z.string(),
            left: z.string(),
        }),
    }),
    scheduler: z.object({
        monthlyReportCron: z.string(),
        feeReminderCron: z.string(),
        attendanceAlertCron: z.string(),
    }),
    logging: z.object({
        level: z.enum(["debug", "info", "warn", "error"]),
        prettyPrint: z.boolean(),
    }),
});
//# sourceMappingURL=index.js.map