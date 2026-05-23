/**
 * Workflow Execution Engine
 * Manages safe, auditable automation workflows
 * Provides recovery and idempotency support
 */

import { v4 as uuidv4 } from "uuid";
import { logger } from "./logger";
import fs from "fs/promises";
import path from "path";

/**
 * Workflow Step Status
 */
export enum WorkflowStepStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  RETRYING = "retrying",
}

/**
 * Workflow Step Definition
 */
export interface WorkflowStep {
  id: string;
  name: string;
  status: WorkflowStepStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  result?: any;
  retries: number;
  maxRetries: number;
}

/**
 * Workflow Execution Context
 */
export interface WorkflowContext {
  id: string;
  type: string;
  status: "in_progress" | "completed" | "failed" | "manual_approval_required";
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
  metadata: Record<string, any>;
  auditTrail: AuditLogEntry[];
}

/**
 * Audit Log Entry
 */
export interface AuditLogEntry {
  timestamp: string;
  event: string;
  actor: string;
  details: Record<string, any>;
  severity: "info" | "warning" | "error";
}

/**
 * Workflow Execution Engine
 */
export class WorkflowEngine {
  private workflows: Map<string, WorkflowContext> = new Map();
  private storageDir: string;
  private executionLog: AuditLogEntry[] = [];

  constructor(storageDir: string = "/app/storage/workflows") {
    this.storageDir = storageDir;
  }

  /**
   * Initialize storage
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
      logger.info({ storageDir: this.storageDir }, "Workflow storage initialized");
    } catch (error) {
      logger.error({ error }, "Failed to initialize workflow storage");
      throw error;
    }
  }

  /**
   * Create new workflow
   */
  createWorkflow(
    type: string,
    steps: string[],
    metadata: Record<string, any> = {},
  ): string {
    const workflowId = uuidv4();
    const now = new Date().toISOString();

    const workflow: WorkflowContext = {
      id: workflowId,
      type,
      status: "in_progress",
      steps: steps.map((name, index) => ({
        id: `${workflowId}-step-${index}`,
        name,
        status: index === 0 ? WorkflowStepStatus.PENDING : WorkflowStepStatus.PENDING,
        retries: 0,
        maxRetries: 3,
      })),
      startedAt: now,
      metadata,
      auditTrail: [
        {
          timestamp: now,
          event: "workflow_created",
          actor: "system",
          details: { type, stepCount: steps.length },
          severity: "info",
        },
      ],
    };

    this.workflows.set(workflowId, workflow);
    logger.info({ workflowId, type }, "Workflow created");

    return workflowId;
  }

  /**
   * Move step to next status
   */
  async updateStepStatus(
    workflowId: string,
    stepIndex: number,
    status: WorkflowStepStatus,
    result?: any,
    error?: string,
  ): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const step = workflow.steps[stepIndex];
    if (!step) {
      throw new Error(`Step not found at index ${stepIndex}`);
    }

    const now = new Date().toISOString();

    // Update step
    step.status = status;
    if (status === WorkflowStepStatus.IN_PROGRESS) {
      step.startedAt = now;
    } else if (status === WorkflowStepStatus.COMPLETED) {
      step.completedAt = now;
      step.result = result;
    } else if (status === WorkflowStepStatus.FAILED) {
      step.error = error;
      if (step.retries < step.maxRetries) {
        step.retries++;
        step.status = WorkflowStepStatus.RETRYING;
      } else {
        workflow.status = "failed";
        workflow.error = error;
        workflow.completedAt = now;
      }
    }

    // Add audit entry
    workflow.auditTrail.push({
      timestamp: now,
      event: `step_${status}`,
      actor: "workflow-engine",
      details: { step: step.name, stepIndex, error, result },
      severity: status === WorkflowStepStatus.FAILED ? "error" : "info",
    });

    // Persist to storage
    await this.persistWorkflow(workflowId);

    logger.info(
      { workflowId, step: step.name, status },
      "Workflow step updated",
    );
  }

  /**
   * Mark workflow as ready for approval
   */
  async markForApproval(workflowId: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    workflow.status = "manual_approval_required";

    workflow.auditTrail.push({
      timestamp: new Date().toISOString(),
      event: "awaiting_approval",
      actor: "workflow-engine",
      details: { workflowId },
      severity: "warning",
    });

    await this.persistWorkflow(workflowId);
    logger.warn({ workflowId }, "Workflow marked for manual approval");
  }

  /**
   * Complete workflow
   */
  async completeWorkflow(workflowId: string, approvedBy?: string): Promise<void> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const now = new Date().toISOString();
    workflow.status = "completed";
    workflow.completedAt = now;

    workflow.auditTrail.push({
      timestamp: now,
      event: "workflow_completed",
      actor: approvedBy || "system",
      details: { workflowId },
      severity: "info",
    });

    await this.persistWorkflow(workflowId);
    logger.info({ workflowId, approvedBy }, "Workflow completed");
  }

  /**
   * Get workflow state
   */
  getWorkflow(workflowId: string): WorkflowContext | null {
    return this.workflows.get(workflowId) || null;
  }

  /**
   * Persist workflow to storage
   */
  private async persistWorkflow(workflowId: string): Promise<void> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) return;

      const filepath = path.join(this.storageDir, `${workflowId}.json`);
      await fs.writeFile(filepath, JSON.stringify(workflow, null, 2));

      // Also log to execution log
      this.executionLog.push(...workflow.auditTrail.slice(-1));
    } catch (error) {
      logger.warn({ error }, "Failed to persist workflow");
    }
  }

  /**
   * Recover workflow from storage
   */
  async recoverWorkflow(workflowId: string): Promise<WorkflowContext | null> {
    try {
      const filepath = path.join(this.storageDir, `${workflowId}.json`);
      const data = await fs.readFile(filepath, "utf-8");
      const workflow = JSON.parse(data) as WorkflowContext;
      this.workflows.set(workflowId, workflow);
      logger.info({ workflowId }, "Workflow recovered from storage");
      return workflow;
    } catch (error) {
      logger.warn({ error, workflowId }, "Failed to recover workflow");
      return null;
    }
  }

  /**
   * Get audit log
   */
  getAuditLog(limit: number = 100): AuditLogEntry[] {
    return this.executionLog.slice(-limit);
  }

  /**
   * Export workflow for audit
   */
  async exportWorkflowAudit(workflowId: string): Promise<WorkflowContext | null> {
    const workflow = this.workflows.get(workflowId);

    if (workflow) {
      try {
        const auditPath = path.join(this.storageDir, `${workflowId}-audit.json`);
        await fs.writeFile(auditPath, JSON.stringify(workflow, null, 2));
        logger.info({ workflowId }, "Workflow audit exported");
      } catch (error) {
        logger.warn({ error }, "Failed to export workflow audit");
      }
    }

    return workflow || null;
  }
}

// Singleton instance
let workflowEngineInstance: WorkflowEngine | null = null;

export function getWorkflowEngine(): WorkflowEngine {
  if (!workflowEngineInstance) {
    workflowEngineInstance = new WorkflowEngine();
  }
  return workflowEngineInstance;
}
