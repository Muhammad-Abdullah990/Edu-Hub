export declare class WhatsAppService {
    private browser;
    private page;
    initialize(): Promise<void>;
    close(): Promise<void>;
    prepareDraft(payload: {
        recipient: string;
        message: string;
        attachments?: string[];
    }): Promise<void>;
    private attachFile;
    waitForManualSend(timeoutMs?: number): Promise<boolean>;
    isLoggedIn(): Promise<boolean>;
    getCurrentChat(): Promise<string | null>;
}
export declare const whatsAppService: WhatsAppService;
//# sourceMappingURL=index.d.ts.map