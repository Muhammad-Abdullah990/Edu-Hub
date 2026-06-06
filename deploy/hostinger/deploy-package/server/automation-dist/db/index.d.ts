import type { AutomationJob, CommunicationLog, GeneratedReport, MessageDraft, AutomationEvent } from "../types";
export declare class AutomationDatabase {
    createJob(job: Omit<AutomationJob, "id" | "createdAt" | "updatedAt" | "retryCount">): Promise<AutomationJob>;
    getJobById(jobId: string): Promise<AutomationJob | null>;
    updateJobStatus(jobId: string, status: AutomationJob["status"], metadata?: Record<string, unknown>): Promise<AutomationJob | null>;
    incrementRetryCount(jobId: string): Promise<AutomationJob | null>;
    getPendingJobs(limit?: number): Promise<AutomationJob[]>;
    createCommunicationLog(log: Omit<CommunicationLog, "id" | "createdAt">): Promise<CommunicationLog>;
    createGeneratedReport(report: Omit<GeneratedReport, "id" | "createdAt">): Promise<GeneratedReport>;
    getMessageDraftById(draftId: string): Promise<MessageDraft | null>;
    createMessageDraft(draft: Omit<MessageDraft, "id" | "createdAt" | "updatedAt">): Promise<MessageDraft>;
    updateMessageDraftStatus(draftId: string, status: MessageDraft["status"], reviewedBy?: string): Promise<MessageDraft | null>;
    createAutomationEvent(event: Omit<AutomationEvent, "id" | "triggeredAt" | "processed">): Promise<AutomationEvent>;
    getUnprocessedEvents(limit?: number): Promise<AutomationEvent[]>;
    markEventProcessed(eventId: string): Promise<void>;
}
export declare const automationDb: AutomationDatabase;
//# sourceMappingURL=index.d.ts.map