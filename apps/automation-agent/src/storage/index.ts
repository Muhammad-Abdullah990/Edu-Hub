import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import automationConfig from "../config";
import logger from "../logging";

export class StorageService {
  private basePath: string;

  constructor() {
    this.basePath = automationConfig.storage.basePath;
  }

  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      logger.info({ dirPath }, "Directory created");
    }
  }

  private getReportsPath(): string {
    return path.join(this.basePath, automationConfig.storage.reportsDir);
  }

  private getLogsPath(): string {
    return path.join(this.basePath, automationConfig.storage.logsDir);
  }

  private getDraftsPath(): string {
    return path.join(this.basePath, automationConfig.storage.draftsDir);
  }

  private getTempPath(): string {
    return path.join(this.basePath, automationConfig.storage.tempDir);
  }

  async saveReport(fileName: string, content: Buffer): Promise<{ filePath: string; checksum: string; size: number }> {
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

  async saveLog(fileName: string, content: string): Promise<{ filePath: string; checksum: string; size: number }> {
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

  async saveDraft(fileName: string, content: Buffer): Promise<{ filePath: string; checksum: string; size: number }> {
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

  async saveTempFile(fileName: string, content: Buffer): Promise<{ filePath: string; checksum: string; size: number }> {
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

  async readFile(filePath: string): Promise<Buffer> {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      logger.error({ error, filePath }, "Failed to read file");
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
      logger.info({ filePath }, "File deleted");
    } catch (error) {
      logger.error({ error, filePath }, "Failed to delete file");
      throw error;
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFileStats(filePath: string): Promise<{ size: number; modified: Date }> {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (error) {
      logger.error({ error, filePath }, "Failed to get file stats");
      throw error;
    }
  }

  async listFiles(dirPath: string): Promise<string[]> {
    try {
      const files = await fs.readdir(dirPath);
      return files.map(file => path.join(dirPath, file));
    } catch (error) {
      logger.error({ error, dirPath }, "Failed to list files");
      throw error;
    }
  }

  async cleanTempFiles(olderThanHours = 24): Promise<void> {
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
    } catch (error) {
      logger.error({ error }, "Failed to clean temp files");
      throw error;
    }
  }

  generateFileName(prefix: string, extension: string, timestamp?: Date): string {
    const ts = timestamp || new Date();
    const timestampStr = ts.toISOString().replace(/[:.]/g, "-").slice(0, -5);
    return `${prefix}_${timestampStr}.${extension}`;
  }
}

export const storageService = new StorageService();