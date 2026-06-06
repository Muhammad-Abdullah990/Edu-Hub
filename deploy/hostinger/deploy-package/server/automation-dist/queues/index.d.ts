import { type QueueJobPayload } from "../validation";
import type { AutomationJob } from "../types";
export declare class QueueService {
    private processing;
    enqueue(payload: QueueJobPayload): Promise<AutomationJob>;
    dequeue(): Promise<AutomationJob | null>;
    markJobProcessing(jobId: string): Promise<void>;
    markJobReady(jobId: string): Promise<void>;
    markJobFailed(jobId: string, errorMessage?: string): Promise<void>;
    markJobAwaitingManualSend(jobId: string): Promise<void>;
    markJobCompleted(jobId: string): Promise<void>;
    getJobById(jobId: string): Promise<AutomationJob | null>;
    incrementRetryCount(jobId: string): Promise<AutomationJob | null>;
    processQueue(): Promise<void>;
    private processJob;
    getQueueStats(): Promise<{
        pending: number;
        processing: number;
        ready: number;
        failed: number;
        awaiting_manual_send: number;
        completed: number;
    }>;
}
export declare const queueService: QueueService;
//# sourceMappingURL=index.d.ts.map