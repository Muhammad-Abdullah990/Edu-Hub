import type { AutomationJob } from "../types";
export declare class WorkflowService {
    processMonthlyReportReady(job: AutomationJob): Promise<void>;
    processFeeReminderDue(job: AutomationJob): Promise<void>;
    processAttendanceAlert(job: AutomationJob): Promise<void>;
    processPerformanceAlert(job: AutomationJob): Promise<void>;
    processCustomParentNotification(job: AutomationJob): Promise<void>;
    executeWhatsAppDraft(draftId: string): Promise<void>;
    private fetchStudentData;
    private fetchMonthlyReportData;
    private fetchFeeData;
    processJob(job: AutomationJob): Promise<void>;
}
export declare const workflowService: WorkflowService;
//# sourceMappingURL=index.d.ts.map