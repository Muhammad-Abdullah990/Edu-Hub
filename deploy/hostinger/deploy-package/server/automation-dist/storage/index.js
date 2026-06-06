import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import automationConfig from "../config";
import logger from "../logging";
export class StorageService {
    basePath;
    constructor() {
        this.basePath = automationConfig.storage.basePath;
    }
    async ensureDirectory(dirPath) {
        try {
            await fs.access(dirPath);
        }
        catch {
            await fs.mkdir(dirPath, { recursive: true });
            logger.info({ dirPath }, "Directory created");
        }
    }
    getReportsPath() {
        return path.join(this.basePath, automationConfig.storage.reportsDir);
    }
    getLogsPath() {
        return path.join(this.basePath, automationConfig.storage.logsDir);
    }
    getDraftsPath() {
        return path.join(this.basePath, automationConfig.storage.draftsDir);
    }
    getTempPath() {
        return path.join(this.basePath, automationConfig.storage.tempDir);
    }
    async saveReport(fileName, content) {
        const reportsPath = this.getReportsPath();
        await this.ensureDirectory(reportsPath);
        const filePath = path.join(reportsPath, fileName);
        const checksum = crypto.createHash("sha256").update(content).digest("hex");
        await fs.writeFile(filePath, content);
        logger.info({ filePath, checksum, size: content.length }, "Report saved");
        return {
            filePath,
            checksum,
            size: content.length,
        };
    }
    async saveLog(fileName, content) {
        const logsPath = this.getLogsPath();
        await this.ensureDirectory(logsPath);
        const filePath = path.join(logsPath, fileName);
        const buffer = Buffer.from(content, "utf-8");
        const checksum = crypto.createHash("sha256").update(buffer).digest("hex");
        await fs.writeFile(filePath, content);
        logger.info({ filePath, checksum, size: buffer.length }, "Log saved");
        return {
            filePath,
            checksum,
            size: buffer.length,
        };
    }
    async saveDraft(fileName, content) {
        const draftsPath = this.getDraftsPath();
        await this.ensureDirectory(draftsPath);
        const filePath = path.join(draftsPath, fileName);
        const checksum = crypto.createHash("sha256").update(content).digest("hex");
        await fs.writeFile(filePath, content);
        logger.info({ filePath, checksum, size: content.length }, "Draft saved");
        return {
            filePath,
            checksum,
            size: content.length,
        };
    }
    async saveTempFile(fileName, content) {
        const tempPath = this.getTempPath();
        await this.ensureDirectory(tempPath);
        const filePath = path.join(tempPath, fileName);
        const checksum = crypto.createHash("sha256").update(content).digest("hex");
        await fs.writeFile(filePath, content);
        logger.info({ filePath, checksum, size: content.length }, "Temp file saved");
        return {
            filePath,
            checksum,
            size: content.length,
        };
    }
    async readFile(filePath) {
        try {
            return await fs.readFile(filePath);
        }
        catch (error) {
            logger.error({ error, filePath }, "Failed to read file");
            throw error;
        }
    }
    async deleteFile(filePath) {
        try {
            await fs.unlink(filePath);
            logger.info({ filePath }, "File deleted");
        }
        catch (error) {
            logger.error({ error, filePath }, "Failed to delete file");
            throw error;
        }
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                modified: stats.mtime,
            };
        }
        catch (error) {
            logger.error({ error, filePath }, "Failed to get file stats");
            throw error;
        }
    }
    async listFiles(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            return files.map(file => path.join(dirPath, file));
        }
        catch (error) {
            logger.error({ error, dirPath }, "Failed to list files");
            throw error;
        }
    }
    async cleanTempFiles(olderThanHours = 24) {
        try {
            const tempPath = this.getTempPath();
            const files = await this.listFiles(tempPath);
            const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
            for (const file of files) {
                const stats = await this.getFileStats(file);
                if (stats.modified < cutoff) {
                    await this.deleteFile(file);
                }
            }
            logger.info({ cleanedCount: files.length }, "Temp files cleaned");
        }
        catch (error) {
            logger.error({ error }, "Failed to clean temp files");
            throw error;
        }
    }
    generateFileName(prefix, extension, timestamp) {
        const ts = timestamp || new Date();
        const timestampStr = ts.toISOString().replace(/[:.]/g, "-").slice(0, -5);
        return `${prefix}_${timestampStr}.${extension}`;
    }
}
export const storageService = new StorageService();
//# sourceMappingURL=index.js.map