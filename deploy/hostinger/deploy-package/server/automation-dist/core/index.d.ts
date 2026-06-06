export declare class AutomationCore {
    private running;
    start(): Promise<void>;
    stop(): Promise<void>;
    private startQueueProcessing;
    processJob(jobId: string): Promise<void>;
    executeWhatsAppDraft(draftId: string): Promise<void>;
    getSystemStatus(): Promise<{
        running: boolean;
        queueStats: any;
        schedulerActive: boolean;
        services: {
            pdf: boolean;
            whatsapp: boolean;
            storage: boolean;
        };
    }>;
    cleanup(): Promise<void>;
}
export declare const automationCore: AutomationCore;
//# sourceMappingURL=index.d.ts.map