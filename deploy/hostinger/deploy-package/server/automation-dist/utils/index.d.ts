export declare function generateId(): string;
export declare function formatDate(date: Date): string;
export declare function formatDateTime(date: Date): string;
export declare function sleep(ms: number): Promise<void>;
export declare function retry<T>(fn: () => Promise<T>, attempts?: number, delay?: number): Promise<T>;
export declare function validatePhoneNumber(phone: string): boolean;
export declare function sanitizeFileName(fileName: string): string;
export declare function calculateFileSize(bytes: number): string;
export declare function isValidUrl(url: string): boolean;
export declare function deepClone<T>(obj: T): T;
export declare function generateChecksum(data: Buffer): string;
//# sourceMappingURL=index.d.ts.map