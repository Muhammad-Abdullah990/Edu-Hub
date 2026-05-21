import { chromium, Browser, Page } from "playwright";
import automationConfig from "../config";
import logger from "../logging";

export class WhatsAppService {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: false, // Must be visible for WhatsApp Web
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });

      this.page = await this.browser.newPage();
      logger.info("WhatsApp browser initialized");
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      logger.info("WhatsApp browser closed");
    }
  }

  async prepareDraft(payload: {
    recipient: string;
    message: string;
    attachments?: string[];
  }): Promise<void> {
    if (!this.page) {
      await this.initialize();
    }

    try {
      // Navigate to WhatsApp Web
      await this.page!.goto(automationConfig.whatsapp.webUrl, {
        waitUntil: "networkidle",
        timeout: automationConfig.whatsapp.timeout,
      });

      logger.info("Navigated to WhatsApp Web");

      // Wait for user to scan QR code and load (manual step)
      await this.page!.waitForSelector('[data-testid="chat-list-search"]', {
        timeout: 120000, // 2 minutes for user to scan QR
      });

      logger.info("WhatsApp Web ready");

      // Search for contact
      const searchInput = this.page!.locator('[data-testid="chat-list-search"]');
      await searchInput.fill(payload.recipient);

      // Wait for search results and click on first contact
      await this.page!.waitForSelector('[data-testid="cell-frame-title"]');
      await this.page!.locator('[data-testid="cell-frame-title"]').first().click();

      logger.info({ recipient: payload.recipient }, "Contact selected");

      // Wait for chat to load
      await this.page!.waitForSelector('[data-testid="conversation-compose-box-input"]');

      // Type message
      const messageInput = this.page!.locator('[data-testid="conversation-compose-box-input"]');
      await messageInput.fill(payload.message);

      logger.info("Message pre-filled");

      // Attach files if provided
      if (payload.attachments && payload.attachments.length > 0) {
        for (const attachment of payload.attachments) {
          await this.attachFile(attachment);
        }
        logger.info({ attachmentCount: payload.attachments.length }, "Files attached");
      }

      // IMPORTANT: Do NOT click send button
      // Human operator must manually click send

      logger.info("WhatsApp draft prepared - awaiting manual send");

    } catch (error) {
      logger.error({ error, payload }, "Failed to prepare WhatsApp draft");
      throw error;
    }
  }

  private async attachFile(filePath: string): Promise<void> {
    try {
      // Click attach button
      const attachButton = this.page!.locator('[data-testid="conversation-clip"]');
      await attachButton.click();

      // Click document option
      const documentOption = this.page!.locator('[data-testid="mi-attach-document"]');
      await documentOption.click();

      // Upload file
      const fileInput = this.page!.locator('input[type="file"]');
      await fileInput.setInputFiles(filePath);

      // Wait for upload to complete
      await this.page!.waitForSelector('[data-testid="send"]', { timeout: 30000 });

    } catch (error) {
      logger.error({ error, filePath }, "Failed to attach file");
      throw error;
    }
  }

  async waitForManualSend(timeoutMs = 300000): Promise<boolean> {
    // Wait for send button to be clicked or timeout
    try {
      await this.page!.waitForSelector('[data-testid="msg-time"]', {
        timeout: timeoutMs,
      });
      logger.info("Message sent manually");
      return true;
    } catch {
      logger.warn("Manual send timeout - message may not have been sent");
      return false;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    if (!this.page) return false;

    try {
      await this.page.waitForSelector('[data-testid="chat-list-search"]', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async getCurrentChat(): Promise<string | null> {
    if (!this.page) return null;

    try {
      const chatHeader = this.page.locator('[data-testid="conversation-header"]');
      const headerText = await chatHeader.textContent();
      return headerText || null;
    } catch {
      return null;
    }
  }
}

export const whatsAppService = new WhatsAppService();