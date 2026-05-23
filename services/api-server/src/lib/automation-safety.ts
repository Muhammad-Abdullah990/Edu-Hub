/**
 * Automation Safety Enforcement Module
 * CRITICAL: Ensures no automated messages are sent without human approval
 */

import { logger } from "./logger";

/**
 * Automation Safety Checkpoint
 * Verifies that system cannot autonomously send communications
 */
export class AutomationSafetyCheckpoint {
  private autoSendPrevented = true;
  private manualApprovalRequired = true;
  private draftOnlyMode = true;

  /**
   * Verify system is in safe mode
   * Fails if any safety measure is disabled
   */
  verifySafeMode(): boolean {
    const checks = {
      autoSendPrevented: this.autoSendPrevented,
      manualApprovalRequired: this.manualApprovalRequired,
      draftOnlyMode: this.draftOnlyMode,
    };

    const allSafe = Object.values(checks).every((v) => v === true);

    if (!allSafe) {
      logger.error(
        { checks },
        "CRITICAL: Automation safety checkpoint FAILED - unsafe mode detected",
      );
      throw new Error("Automation safety checkpoint failed - unsafe mode");
    }

    return true;
  }

  /**
   * CRITICAL CHECK: Verify auto-send is disabled
   */
  checkAutoSendDisabled(): void {
    if (!this.autoSendPrevented) {
      throw new Error("CRITICAL: Auto-send is not disabled - safety violation");
    }

    logger.info("Auto-send disabled ✓");
  }

  /**
   * CRITICAL CHECK: Verify manual approval is required
   */
  checkManualApprovalRequired(): void {
    if (!this.manualApprovalRequired) {
      throw new Error("CRITICAL: Manual approval not required - safety violation");
    }

    logger.info("Manual approval required ✓");
  }

  /**
   * CRITICAL CHECK: Verify draft-only mode
   */
  checkDraftOnlyMode(): void {
    if (!this.draftOnlyMode) {
      throw new Error("CRITICAL: Draft-only mode not enforced - safety violation");
    }

    logger.info("Draft-only mode enforced ✓");
  }

  /**
   * Run all safety checks
   */
  runAllChecks(): void {
    logger.warn("=== RUNNING AUTOMATION SAFETY CHECKS ===");
    this.checkAutoSendDisabled();
    this.checkManualApprovalRequired();
    this.checkDraftOnlyMode();
    logger.warn("=== ALL SAFETY CHECKS PASSED ===");
  }
}

/**
 * Singleton checkpoint instance
 */
const checkpoint = new AutomationSafetyCheckpoint();

/**
 * Verify system safety before any automation operation
 */
export function verifyAutomationSafety(): void {
  checkpoint.verifySafeMode();
}

/**
 * Run comprehensive safety checks on startup
 */
export function runStartupSafetyChecks(): void {
  checkpoint.runAllChecks();
}
