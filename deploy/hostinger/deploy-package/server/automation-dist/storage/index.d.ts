export declare class StorageService {
    private basePath;
    constructor();
    private ensureDirectory;
    private getReportsPath;
    private getLogsPath;
    private getDraftsPath;
    private getTempPath;
    saveReport(fileName: string, content: Buffer): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    saveLog(fileName: string, content: string): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    saveDraft(fileName: string, content: Buffer): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    saveTempFile(fileName: string, content: Buffer): Promise<{
        filePath: string;
        checksum: string;
        size: number;
    }>;
    readFile(filePath: string): Promise<Buffer>;
    deleteFile(filePath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    getFileStats(filePath: string): Promise<{
        size: number;
        modified: Date;
    }>;
    listFiles(dirPath: string): Promise<string[]>;
    cleanTempFiles(olderThanHours?: number): Promise<void>;
    generateFileName(prefix: string, extension: string, timestamp?: Date): string;
}
export declare const storageService: StorageService;
//# sourceMappingURL=index.d.ts.map