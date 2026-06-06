import { z } from "zod";
export * from "../types";
export declare const MonthlyReportReadyPayloadSchema: z.ZodObject<{
    studentId: z.ZodString;
    month: z.ZodString;
    year: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    month: string;
    year: number;
}, {
    studentId: string;
    month: string;
    year: number;
}>;
export declare const FeeReminderDuePayloadSchema: z.ZodObject<{
    studentId: z.ZodString;
    feeRecordId: z.ZodString;
    dueDate: z.ZodString;
    amount: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    dueDate: string;
    feeRecordId: string;
    amount: number;
}, {
    studentId: string;
    dueDate: string;
    feeRecordId: string;
    amount: number;
}>;
export declare const AttendanceAlertPayloadSchema: z.ZodObject<{
    studentId: z.ZodString;
    attendancePercentage: z.ZodNumber;
    month: z.ZodString;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    month: string;
    attendancePercentage: number;
}, {
    studentId: string;
    month: string;
    attendancePercentage: number;
}>;
export declare const PerformanceAlertPayloadSchema: z.ZodObject<{
    studentId: z.ZodString;
    subject: z.ZodString;
    grade: z.ZodString;
    teacherNotes: z.ZodString;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    subject: string;
    grade: string;
    teacherNotes: string;
}, {
    studentId: string;
    subject: string;
    grade: string;
    teacherNotes: string;
}>;
export declare const CustomParentNotificationPayloadSchema: z.ZodObject<{
    studentId: z.ZodString;
    parentId: z.ZodString;
    subject: z.ZodString;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    studentId: string;
    parentId: string;
    message: string;
    subject: string;
}, {
    studentId: string;
    parentId: string;
    message: string;
    subject: string;
}>;
export declare const QueueJobPayloadSchema: z.ZodDiscriminatedUnion<"eventType", [z.ZodObject<{
    eventType: z.ZodLiteral<"MONTHLY_REPORT_READY">;
    payload: z.ZodObject<{
        studentId: z.ZodString;
        month: z.ZodString;
        year: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        studentId: string;
        month: string;
        year: number;
    }, {
        studentId: string;
        month: string;
        year: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: "MONTHLY_REPORT_READY";
    payload: {
        studentId: string;
        month: string;
        year: number;
    };
}, {
    eventType: "MONTHLY_REPORT_READY";
    payload: {
        studentId: string;
        month: string;
        year: number;
    };
}>, z.ZodObject<{
    eventType: z.ZodLiteral<"FEE_REMINDER_DUE">;
    payload: z.ZodObject<{
        studentId: z.ZodString;
        feeRecordId: z.ZodString;
        dueDate: z.ZodString;
        amount: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        studentId: string;
        dueDate: string;
        feeRecordId: string;
        amount: number;
    }, {
        studentId: string;
        dueDate: string;
        feeRecordId: string;
        amount: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: "FEE_REMINDER_DUE";
    payload: {
        studentId: string;
        dueDate: string;
        feeRecordId: string;
        amount: number;
    };
}, {
    eventType: "FEE_REMINDER_DUE";
    payload: {
        studentId: string;
        dueDate: string;
        feeRecordId: string;
        amount: number;
    };
}>, z.ZodObject<{
    eventType: z.ZodLiteral<"ATTENDANCE_ALERT">;
    payload: z.ZodObject<{
        studentId: z.ZodString;
        attendancePercentage: z.ZodNumber;
        month: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        studentId: string;
        month: string;
        attendancePercentage: number;
    }, {
        studentId: string;
        month: string;
        attendancePercentage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: "ATTENDANCE_ALERT";
    payload: {
        studentId: string;
        month: string;
        attendancePercentage: number;
    };
}, {
    eventType: "ATTENDANCE_ALERT";
    payload: {
        studentId: string;
        month: string;
        attendancePercentage: number;
    };
}>, z.ZodObject<{
    eventType: z.ZodLiteral<"PERFORMANCE_ALERT">;
    payload: z.ZodObject<{
        studentId: z.ZodString;
        subject: z.ZodString;
        grade: z.ZodString;
        teacherNotes: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        studentId: string;
        subject: string;
        grade: string;
        teacherNotes: string;
    }, {
        studentId: string;
        subject: string;
        grade: string;
        teacherNotes: string;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: "PERFORMANCE_ALERT";
    payload: {
        studentId: string;
        subject: string;
        grade: string;
        teacherNotes: string;
    };
}, {
    eventType: "PERFORMANCE_ALERT";
    payload: {
        studentId: string;
        subject: string;
        grade: string;
        teacherNotes: string;
    };
}>, z.ZodObject<{
    eventType: z.ZodLiteral<"CUSTOM_PARENT_NOTIFICATION">;
    payload: z.ZodObject<{
        studentId: z.ZodString;
        parentId: z.ZodString;
        subject: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        studentId: string;
        parentId: string;
        message: string;
        subject: string;
    }, {
        studentId: string;
        parentId: string;
        message: string;
        subject: string;
    }>;
}, "strip", z.ZodTypeAny, {
    eventType: "CUSTOM_PARENT_NOTIFICATION";
    payload: {
        studentId: string;
        parentId: string;
        message: string;
        subject: string;
    };
}, {
    eventType: "CUSTOM_PARENT_NOTIFICATION";
    payload: {
        studentId: string;
        parentId: string;
        message: string;
        subject: string;
    };
}>]>;
export type QueueJobPayload = z.infer<typeof QueueJobPayloadSchema>;
export declare const MonthlyReportTemplateDataSchema: z.ZodObject<{
    studentName: z.ZodString;
    parentName: z.ZodString;
    attendancePercentage: z.ZodNumber;
    teacherNotes: z.ZodString;
    strengths: z.ZodArray<z.ZodString, "many">;
    weaknesses: z.ZodArray<z.ZodString, "many">;
    recommendations: z.ZodArray<z.ZodString, "many">;
    academicProgress: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    generatedAt: z.ZodString;
    institutionName: z.ZodString;
}, "strip", z.ZodTypeAny, {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    academicProgress: Record<string, unknown>;
    attendancePercentage: number;
    generatedAt: string;
    teacherNotes: string;
    studentName: string;
    parentName: string;
    institutionName: string;
}, {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    academicProgress: Record<string, unknown>;
    attendancePercentage: number;
    generatedAt: string;
    teacherNotes: string;
    studentName: string;
    parentName: string;
    institutionName: string;
}>;
export declare const FeeReminderTemplateDataSchema: z.ZodObject<{
    studentName: z.ZodString;
    parentName: z.ZodString;
    feeAmount: z.ZodNumber;
    dueDate: z.ZodString;
    outstandingAmount: z.ZodNumber;
    generatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    outstandingAmount: number;
    dueDate: string;
    generatedAt: string;
    studentName: string;
    parentName: string;
    feeAmount: number;
}, {
    outstandingAmount: number;
    dueDate: string;
    generatedAt: string;
    studentName: string;
    parentName: string;
    feeAmount: number;
}>;
export declare const FileMetadataSchema: z.ZodObject<{
    path: z.ZodString;
    name: z.ZodString;
    size: z.ZodNumber;
    checksum: z.ZodString;
    mimeType: z.ZodString;
    createdAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    name: string;
    createdAt: Date;
    checksum: string;
    path: string;
    size: number;
    mimeType: string;
}, {
    name: string;
    createdAt: Date;
    checksum: string;
    path: string;
    size: number;
    mimeType: string;
}>;
export declare const AutomationConfigSchema: z.ZodObject<{
    storage: z.ZodObject<{
        basePath: z.ZodString;
        reportsDir: z.ZodString;
        logsDir: z.ZodString;
        draftsDir: z.ZodString;
        tempDir: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        basePath: string;
        reportsDir: string;
        logsDir: string;
        draftsDir: string;
        tempDir: string;
    }, {
        basePath: string;
        reportsDir: string;
        logsDir: string;
        draftsDir: string;
        tempDir: string;
    }>;
    whatsapp: z.ZodObject<{
        webUrl: z.ZodString;
        timeout: z.ZodNumber;
        retryAttempts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        webUrl: string;
        timeout: number;
        retryAttempts: number;
    }, {
        webUrl: string;
        timeout: number;
        retryAttempts: number;
    }>;
    pdf: z.ZodObject<{
        timeout: z.ZodNumber;
        format: z.ZodEnum<["A4", "Letter"]>;
        margin: z.ZodObject<{
            top: z.ZodString;
            right: z.ZodString;
            bottom: z.ZodString;
            left: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            top: string;
            right: string;
            bottom: string;
            left: string;
        }, {
            top: string;
            right: string;
            bottom: string;
            left: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        format: "A4" | "Letter";
        margin: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
    }, {
        timeout: number;
        format: "A4" | "Letter";
        margin: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
    }>;
    scheduler: z.ZodObject<{
        monthlyReportCron: z.ZodString;
        feeReminderCron: z.ZodString;
        attendanceAlertCron: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        monthlyReportCron: string;
        feeReminderCron: string;
        attendanceAlertCron: string;
    }, {
        monthlyReportCron: string;
        feeReminderCron: string;
        attendanceAlertCron: string;
    }>;
    logging: z.ZodObject<{
        level: z.ZodEnum<["debug", "info", "warn", "error"]>;
        prettyPrint: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    }, {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    whatsapp: {
        webUrl: string;
        timeout: number;
        retryAttempts: number;
    };
    storage: {
        basePath: string;
        reportsDir: string;
        logsDir: string;
        draftsDir: string;
        tempDir: string;
    };
    pdf: {
        timeout: number;
        format: "A4" | "Letter";
        margin: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
    };
    scheduler: {
        monthlyReportCron: string;
        feeReminderCron: string;
        attendanceAlertCron: string;
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    };
}, {
    whatsapp: {
        webUrl: string;
        timeout: number;
        retryAttempts: number;
    };
    storage: {
        basePath: string;
        reportsDir: string;
        logsDir: string;
        draftsDir: string;
        tempDir: string;
    };
    pdf: {
        timeout: number;
        format: "A4" | "Letter";
        margin: {
            top: string;
            right: string;
            bottom: string;
            left: string;
        };
    };
    scheduler: {
        monthlyReportCron: string;
        feeReminderCron: string;
        attendanceAlertCron: string;
    };
    logging: {
        level: "debug" | "info" | "warn" | "error";
        prettyPrint: boolean;
    };
}>;
export type AutomationConfig = z.infer<typeof AutomationConfigSchema>;
//# sourceMappingURL=index.d.ts.map