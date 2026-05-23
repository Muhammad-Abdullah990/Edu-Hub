/**
 * Automation Job Service
 * Manages queuing of automation workflows
 * Ensures human-in-the-loop safety for WhatsApp communication
 */

import { getQueueService, JobType, JobPayload } from "./queue";
import { logger } from "./logger";
import { v4 as uuidv4 } from "uuid";

/**
 * Automation Workflow Payload
 */
export interface AutomationPayload extends JobPayload {
  workflowType: "monthly_report" | "attendance_alert" | "fee_reminder" | "engagement_check";
  studentId: string;
  recipientPhone: string;
  draftData: {
    message: string;
    attachments?: string[];
    templateData?: Record<string, any>;
  };
}

/**
 * Workflow Execution State
 */
export interface WorkflowState {
  id: string;
  jobId: string;
  status: "draft_prepared" | "awaiting_approval" | "sent" | "failed";
  workflowType: string;
  studentId: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  sentAt?: string;
  error?: string;
}

/**
 * Automation Service
 */
export class AutomationService {
  private get queueService() {
    return getQueueService();
  }
  private workflowStates: Map<string, WorkflowState> = new Map();

  /**
   * Queue WhatsApp communication preparation
   * Prepares draft but does NOT send automatically
   */
  async prepareWhatsAppCommunication(
    workflowType: "monthly_report" | "attendance_alert" | "fee_reminder" | "engagement_check",
    studentId: string,
    recipientPhone: string,
    draftData: AutomationPayload["draftData"],
  ): Promise<{ jobId: string; workflowId: string }> {
    const workflowId = uuidv4();
    const payload: AutomationPayload = {
      correlationId: uuidv4(),
      userId: "system",
      timestamp: new Date().toISOString(),
      workflowType,
      studentId,
      recipientPhone,
      draftData,
    };

    const jobId = await this.queueService.enqueue(
      JobType.PREPARE_WHATSAPP_COMMUNICATION,
      payload,
    );

    // Initialize workflow state
    const state: WorkflowState = {
      id: workflowId,
      jobId,
      status: "draft_prepared",
      workflowType,
      studentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.workflowStates.set(workflowId, state);

    logger.info(
      { workflowId, jobId, studentId, workflowType },
      "WhatsApp communication preparation queued - AWAITING MANUAL APPROVAL",
    );

    return { jobId, workflowId };
  }

  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId: string): WorkflowState | null {
    return this.workflowStates.get(workflowId) || null;
  }

  /**
   * CRITICAL: Approve workflow for sending
   * Human operator must explicitly approve before any messages are sent
   */
  async approveAndSendWorkflow(workflowId: string, approvedBy: string): Promise<void> {
    const state = this.workflowStates.get(workflowId);

    if (!state) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    if (state.status !== "draft_prepared") {
      throw new Error(`Cannot approve workflow in ${state.status} state`);
    }

    // Update state
    state.status = "sent";
    state.approvedBy = approvedBy;
    state.approvedAt = new Date().toISOString();
    state.sentAt = new Date().toISOString();
    state.updatedAt = new Date().toISOString();

    this.workflowStates.set(workflowId, state);

    logger.info(
      { workflowId, approvedBy, studentId: state.studentId },
      "Workflow approved and sent by human operator",
    );
  }

  /**
   * Reject workflow
   */
  async rejectWorkflow(workflowId: string, reason: string): Promise<void> {
    const state = this.workflowStates.get(workflowId);

    if (!state) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    state.status = "failed";
    state.error = `Rejected: ${reason}`;
    state.updatedAt = new Date().toISOString();

    this.workflowStates.set(workflowId, state);

    logger.info(
      { workflowId, reason, studentId: state.studentId },
      "Workflow rejected",
    );
  }

  /**
   * Get all pending workflows awaiting approval
   */
  getPendingWorkflows(): WorkflowState[] {
    return Array.from(this.workflowStates.values()).filter(
      (state) => state.status === "draft_prepared",
    );
  }

  /**
   * Get recent workflow history
   */
  getRecentWorkflows(limit: number = 50): WorkflowState[] {
    return Array.from(this.workflowStates.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

// Singleton instance
let automationServiceInstance: AutomationService | null = null;

export function getAutomationService(): AutomationService {
  if (!automationServiceInstance) {
    automationServiceInstance = new AutomationService();
  }
  return automationServiceInstance;
}
