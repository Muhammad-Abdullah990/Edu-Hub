export declare const automationConfig: {
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
};
export default automationConfig;
//# sourceMappingURL=index.d.ts.map