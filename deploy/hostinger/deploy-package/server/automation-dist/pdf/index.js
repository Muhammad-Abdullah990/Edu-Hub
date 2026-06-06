import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";
import automationConfig from "../config";
import { storageService } from "../storage";
import logger from "../logging";
export class PDFGenerator {
    browser = null;
    async initialize() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
            logger.info("Puppeteer browser initialized");
        }
    }
    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            logger.info("Puppeteer browser closed");
        }
    }
    async generateFromTemplate(templatePath, data, outputFileName) {
        if (!this.browser) {
            await this.initialize();
        }
        try {
            const page = await this.browser.newPage();
            // Read template
            const templateContent = await fs.readFile(templatePath, "utf-8");
            // Inject data into template (simple string replacement for now)
            let htmlContent = templateContent;
            for (const [key, value] of Object.entries(data)) {
                const placeholder = `{{${key}}}`;
                htmlContent = htmlContent.replace(new RegExp(placeholder, "g"), String(value));
            }
            await page.setContent(htmlContent, { waitUntil: "networkidle0" });
            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: automationConfig.pdf.format,
                margin: automationConfig.pdf.margin,
                printBackground: true,
                timeout: automationConfig.pdf.timeout,
            });
            await page.close();
            // Save PDF
            const result = await storageService.saveReport(outputFileName, pdfBuffer);
            logger.info({ outputFileName, filePath: result.filePath }, "PDF generated successfully");
            return result;
        }
        catch (error) {
            logger.error({ error, templatePath, outputFileName }, "Failed to generate PDF");
            throw error;
        }
    }
    async generateMonthlyReport(studentId, data) {
        const templatePath = path.join(__dirname, "../templates/monthly-report.html");
        const fileName = storageService.generateFileName(`monthly_report_${studentId}`, "pdf");
        // Transform data for template
        const templateData = {
            ...data,
            totalDays: data.totalDays ?? 0,
            presentDays: data.presentDays ?? 0,
            absentDays: data.absentDays ?? 0,
            strengthsList: data.strengths.join(", "),
            weaknessesList: data.weaknesses.join(", "),
            recommendationsList: data.recommendations.join(", "),
            academicProgressJson: JSON.stringify(data.academicProgress, null, 2),
        };
        return this.generateFromTemplate(templatePath, templateData, fileName);
    }
    async generateFeeReminder(studentId, data) {
        const templatePath = path.join(__dirname, "../templates/fee-reminder.html");
        const fileName = storageService.generateFileName(`fee_reminder_${studentId}`, "pdf");
        return this.generateFromTemplate(templatePath, data, fileName);
    }
}
export const pdfGenerator = new PDFGenerator();
//# sourceMappingURL=index.js.map