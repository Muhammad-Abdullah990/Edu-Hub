/**
 * Playwright Stability & Resilience Layer
 * Abstracts fragile DOM selectors and adds recovery mechanisms
 */

import { chromium, Browser, Page, Locator, BrowserContext } from "playwright";
import { logger } from "./logger";

/**
 * Selector Strategy with Fallbacks
 */
export interface SelectorStrategy {
  primary: string;
  fallbacks?: string[];
  description: string;
  timeout?: number;
}

/**
 * Playwright Service with Stability Enhancements
 */
export class PlaywrightService {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  /**
   * Selector strategies for robust element selection
   */
  private selectors = {
    whatsappWebUrl: "https://web.whatsapp.com",
    searchInput: {
      primary: '[data-testid="chat-list-search"]',
      fallbacks: [
        'input[placeholder*="Search"]',
        'input[aria-label*="Search"]',
        'input[placeholder*="chat"]',
      ],
      description: "WhatsApp search input field",
      timeout: 120000, // 2 minutes for manual QR scan
    },
    contactItem: {
      primary: '[data-testid="cell-frame-title"]',
      fallbacks: [
        '[data-testid^="cell-frame-"]',
        ".chat-item", // Alternative selector
        '[role="button"][aria-label*="Chat"]',
      ],
      description: "Contact item in search results",
      timeout: 5000,
    },
    messageInput: {
      primary: '[data-testid="conversation-compose-box-input"]',
      fallbacks: [
        'footer textarea',
        'footer input[placeholder*="message"]',
        '.ql-editor',
      ],
      description: "Message input field",
      timeout: 5000,
    },
    attachmentButton: {
      primary: '[data-testid="compose-btn-attach"]',
      fallbacks: [
        'button[aria-label*="Attach"]',
        'button[title*="Attachment"]',
      ],
      description: "File attachment button",
      timeout: 5000,
    },
    sendButton: {
      primary: '[data-testid="compose-btn-send"]',
      fallbacks: [
        'button[aria-label*="Send"]',
        'button[title*="Send"]',
        'button.send-button',
      ],
      description: "Send button (NOT used - safety measure)",
      timeout: 5000,
    },
  };

  /**
   * Initialize browser with stability measures
   */
  async initialize(headless: boolean = false): Promise<void> {
    try {
      logger.info("Initializing Playwright browser");

      this.browser = await chromium.launch({
        headless,
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

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      this.page = await this.context.newPage();

      logger.info("Playwright browser initialized successfully");
    } catch (error) {
      logger.error({ error }, "Failed to initialize browser");
      throw error;
    }
  }

  /**
   * Find element with selector fallback strategy
   */
  async findElement(strategy: SelectorStrategy): Promise<Locator | null> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    const selectors = [strategy.primary, ...(strategy.fallbacks || [])];

    for (let i = 0; i < selectors.length; i++) {
      const selector = selectors[i];
      try {
        logger.debug(
          { selector, strategy: strategy.description },
          `Attempting selector (${i + 1}/${selectors.length})`,
        );

        const element = this.page.locator(selector);

        // Verify element exists
        await element.waitFor({
          state: "visible",
          timeout: strategy.timeout || 5000,
        });

        logger.debug({ selector }, "Element found");
        return element;
      } catch (error) {
        logger.debug(
          { selector, error: String(error) },
          "Selector failed, trying next",
        );
      }
    }

    logger.warn(
      { strategy: strategy.description, selectors },
      "No selector strategy worked",
    );
    return null;
  }

  /**
   * Validate DOM state before action
   */
  async validateDOMReady(): Promise<boolean> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    try {
      await this.page.waitForLoadState("networkidle");
      return true;
    } catch (error) {
      logger.warn({ error }, "DOM validation failed");
      return false;
    }
  }

  /**
   * Navigate with retry
   */
  async navigateWithRetry(
    url: string,
    maxAttempts: number = 3,
  ): Promise<void> {
    if (!this.page) {
      throw new Error("Browser not initialized");
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        logger.info(
          { url, attempt, maxAttempts },
          "Attempting navigation",
        );

        await this.page.goto(url, {
          waitUntil: "networkidle",
          timeout: 60000,
        });

        logger.info({ url }, "Navigation successful");
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          logger.error({ error, url }, "Navigation failed after retries");
          throw error;
        }

        logger.warn({ error, url, attempt }, "Navigation retry");
        await this.delay(2000);
      }
    }
  }

  /**
   * Type with validation
   */
  async typeWithValidation(
    locator: Locator,
    text: string,
    delay: number = 50,
  ): Promise<void> {
    try {
      await locator.fill("");
      await locator.type(text, { delay });
      logger.debug("Text entered successfully");
    } catch (error) {
      logger.error({ error }, "Failed to type text");
      throw error;
    }
  }

  /**
   * Click with validation
   */
  async clickWithValidation(locator: Locator): Promise<void> {
    try {
      await locator.click();
      logger.debug("Click executed successfully");
    } catch (error) {
      logger.error({ error }, "Failed to click element");
      throw error;
    }
  }

  /**
   * CRITICAL: Explicitly prevent send button click
   */
  async preventAutoSend(): Promise<void> {
    if (!this.page) return;

    try {
      // Find send button
      const sendButton = await this.findElement(this.selectors.sendButton);

      if (sendButton) {
        // Disable send button to prevent accidental clicks
        await this.page.evaluate(() => {
          const buttons = document.querySelectorAll('[data-testid="compose-btn-send"]');
          buttons.forEach((btn: any) => {
            btn.disabled = true;
            btn.style.opacity = "0.5";
            btn.title = "SEND DISABLED - Manual approval required";
          });
        });

        logger.warn("Send button disabled - manual approval required");
      }
    } catch (error) {
      logger.warn({ error }, "Could not disable send button");
    }
  }

  /**
   * Wait before continuing (operator override window)
   */
  async waitForManualApproval(timeoutSeconds: number = 600): Promise<void> {
    logger.warn(
      `Waiting for manual approval (timeout: ${timeoutSeconds}s)`,
    );
    await this.delay(timeoutSeconds * 1000);
  }

  /**
   * Take screenshot for debugging
   */
  async screenshot(filename: string): Promise<void> {
    if (!this.page) return;

    try {
      await this.page.screenshot({ path: filename });
      logger.debug({ filename }, "Screenshot captured");
    } catch (error) {
      logger.warn({ error }, "Failed to capture screenshot");
    }
  }

  /**
   * Get page title for verification
   */
  async getPageTitle(): Promise<string> {
    if (!this.page) return "";
    return this.page.title();
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }

    logger.info("Browser closed");
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
let playwrightServiceInstance: PlaywrightService | null = null;

export function getPlaywrightService(): PlaywrightService {
  if (!playwrightServiceInstance) {
    playwrightServiceInstance = new PlaywrightService();
  }
  return playwrightServiceInstance;
}
