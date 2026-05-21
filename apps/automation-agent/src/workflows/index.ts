import { automationDb } from "../db";
import { pdfGenerator } from "../pdf";
import { whatsAppService } from "../whatsapp";
import { storageService } from "../storage";
import { queueService } from "../queues";
import { eventService } from "../events";
import type { AutomationJob } from "../types";
import logger from "../logging";

export class WorkflowService {
  async processMonthlyReportReady(job: AutomationJob): Promise<void> {
    const { studentId, month, year } = job.payload as {
      studentId: string;
      month: string;
      year: number;
    };

    logger.info({ jobId: job.id, studentId, month, year }, "Processing monthly report workflow");

    // Fetch student data (would integrate with API)
    const studentData = await this.fetchStudentData(studentId);
    const reportData = await this.fetchMonthlyReportData(studentId, month, year);

    // Generate PDF
    const pdfResult = await pdfGenerator.generateMonthlyReport(studentId, {
      studentName: studentData.name,
      parentName: studentData.parentName,
      attendancePercentage: reportData.attendancePercentage,
      teacherNotes: reportData.teacherNotes,
      strengths: reportData.strengths,
      weaknesses: reportData.weaknesses,
      recommendations: reportData.recommendations,
      academicProgress: reportData.academicProgress,
      generatedAt: new Date().toISOString(),
      institutionName: "Toppers Coaching Center",
    });

    // Save report metadata
    await automationDb.createGeneratedReport({
      jobId: job.id,
      studentId,
      reportType: "monthly",
      filePath: pdfResult.filePath,
      fileName: pdfResult.filePath.split("/").pop() || "",
      fileSize: pdfResult.size,
      checksum: pdfResult.checksum,
      metadata: { month, year },
    });

    // Create message draft
    const message = `Dear ${studentData.parentName},\n\nPlease find attached the monthly progress report for ${studentData.name} for ${month} ${year}.\n\nBest regards,\nToppers Coaching Center`;

    await automationDb.createMessageDraft({
      jobId: job.id,
      studentId,
      parentId: studentData.parentId,
      channel: "whatsapp",
      recipient: studentData.parentPhone,
      subject: `Monthly Report - ${studentData.name}`,
      message,
      attachments: [pdfResult.filePath],
      status: "draft",
    });

    // Mark job as ready for manual send
    await queueService.markJobAwaitingManualSend(job.id);

    logger.info({ jobId: job.id }, "Monthly report workflow completed");
  }

  async processFeeReminderDue(job: AutomationJob): Promise<void> {
    const { studentId, feeRecordId, dueDate, amount } = job.payload as {
      studentId: string;
      feeRecordId: string;
      dueDate: string;
      amount: number;
    };

    logger.info({ jobId: job.id, studentId, feeRecordId }, "Processing fee reminder workflow");

    // Fetch student and fee data
    const studentData = await this.fetchStudentData(studentId);
    const feeData = await this.fetchFeeData(feeRecordId);

    // Generate PDF reminder
    const pdfResult = await pdfGenerator.generateFeeReminder(studentId, {
      studentName: studentData.name,
      parentName: studentData.parentName,
      feeAmount: amount,
      dueDate,
      outstandingAmount: feeData.outstandingAmount,
      generatedAt: new Date().toISOString(),
    });

    // Save report metadata
    await automationDb.createGeneratedReport({
      jobId: job.id,
      studentId,
      reportType: "fee_reminder",
      filePath: pdfResult.filePath,
      fileName: pdfResult.filePath.split("/").pop() || "",
      fileSize: pdfResult.size,
      checksum: pdfResult.checksum,
      metadata: { feeRecordId, dueDate },
    });

    // Create message draft
    const message = `Dear ${studentData.parentName},\n\nThis is a reminder that the fee payment of $${amount} for ${studentData.name} is due on ${dueDate}.\n\nPlease find attached the fee reminder document.\n\nBest regards,\nToppers Coaching Center`;

    await automationDb.createMessageDraft({
      jobId: job.id,
      studentId,
      parentId: studentData.parentId,
      channel: "whatsapp",
      recipient: studentData.parentPhone,
      subject: `Fee Reminder - ${studentData.name}`,
      message,
      attachments: [pdfResult.filePath],
      status: "draft",
    });

    // Mark job as ready for manual send
    await queueService.markJobAwaitingManualSend(job.id);

    logger.info({ jobId: job.id }, "Fee reminder workflow completed");
  }

  async processAttendanceAlert(job: AutomationJob): Promise<void> {
    const { studentId, attendancePercentage, month } = job.payload as {
      studentId: string;
      attendancePercentage: number;
      month: string;
    };

    logger.info({ jobId: job.id, studentId, attendancePercentage }, "Processing attendance alert workflow");

    const studentData = await this.fetchStudentData(studentId);

    const message = `Dear ${studentData.parentName},\n\nWe noticed that ${studentData.name}'s attendance for ${month} is ${attendancePercentage}%. Please ensure regular attendance.\n\nBest regards,\nToppers Coaching Center`;

    await automationDb.createMessageDraft({
      jobId: job.id,
      studentId,
      parentId: studentData.parentId,
      channel: "whatsapp",
      recipient: studentData.parentPhone,
      subject: `Attendance Alert - ${studentData.name}`,
      message,
      status: "draft",
    });

    await queueService.markJobAwaitingManualSend(job.id);

    logger.info({ jobId: job.id }, "Attendance alert workflow completed");
  }

  async processPerformanceAlert(job: AutomationJob): Promise<void> {
    const { studentId, subject, grade, teacherNotes } = job.payload as {
      studentId: string;
      subject: string;
      grade: string;
      teacherNotes: string;
    };

    logger.info({ jobId: job.id, studentId, subject }, "Processing performance alert workflow");

    const studentData = await this.fetchStudentData(studentId);

    const message = `Dear ${studentData.parentName},\n\nRegarding ${studentData.name}'s performance in ${subject}:\nGrade: ${grade}\n\nTeacher Notes: ${teacherNotes}\n\nPlease schedule a meeting if needed.\n\nBest regards,\nToppers Coaching Center`;

    await automationDb.createMessageDraft({
      jobId: job.id,
      studentId,
      parentId: studentData.parentId,
      channel: "whatsapp",
      recipient: studentData.parentPhone,
      subject: `Performance Alert - ${studentData.name}`,
      message,
      status: "draft",
    });

    await queueService.markJobAwaitingManualSend(job.id);

    logger.info({ jobId: job.id }, "Performance alert workflow completed");
  }

  async processCustomParentNotification(job: AutomationJob): Promise<void> {
    const { studentId, parentId, subject, message } = job.payload as {
      studentId: string;
      parentId: string;
      subject: string;
      message: string;
    };

    logger.info({ jobId: job.id, studentId, parentId }, "Processing custom notification workflow");

    const studentData = await this.fetchStudentData(studentId);

    await automationDb.createMessageDraft({
      jobId: job.id,
      studentId,
      parentId,
      channel: "whatsapp",
      recipient: studentData.parentPhone,
      subject,
      message,
      status: "draft",
    });

    await queueService.markJobAwaitingManualSend(job.id);

    logger.info({ jobId: job.id }, "Custom notification workflow completed");
  }

  async executeWhatsAppDraft(draftId: string): Promise<void> {
    const draft = await automationDb.getMessageDraftById?.(draftId); // Need to add this method
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`);
    }

    await whatsAppService.prepareDraft({
      recipient: draft.recipient,
      message: draft.message,
      attachments: draft.attachments,
    });

    // Mark draft as reviewed
    await automationDb.updateMessageDraftStatus(draftId, "reviewed", "system");

    logger.info({ draftId }, "WhatsApp draft executed");
  }

  // Placeholder methods - would integrate with actual API
  private async fetchStudentData(studentId: string) {
    // Mock data - replace with actual API call
    return {
      id: studentId,
      name: "John Doe",
      parentId: "parent-123",
      parentName: "Jane Doe",
      parentPhone: "+1234567890",
    };
  }

  private async fetchMonthlyReportData(studentId: string, month: string, year: number) {
    // Mock data - replace with actual API call
    return {
      attendancePercentage: 85,
      teacherNotes: "Good progress this month",
      strengths: ["Mathematics", "Science"],
      weaknesses: ["English"],
      recommendations: ["Practice more reading", "Join extra classes"],
      academicProgress: {
        Mathematics: "A",
        Science: "A-",
        English: "B+",
      },
    };
  }

  private async fetchFeeData(feeRecordId: string) {
    // Mock data - replace with actual API call
    return {
      outstandingAmount: 1500,
    };
  }

  async processJob(job: AutomationJob): Promise<void> {
    switch (job.eventType) {
      case "MONTHLY_REPORT_READY":
        await this.processMonthlyReportReady(job);
        break;
      case "FEE_REMINDER_DUE":
        await this.processFeeReminderDue(job);
        break;
      case "ATTENDANCE_ALERT":
        await this.processAttendanceAlert(job);
        break;
      case "PERFORMANCE_ALERT":
        await this.processPerformanceAlert(job);
        break;
      case "CUSTOM_PARENT_NOTIFICATION":
        await this.processCustomParentNotification(job);
        break;
      default:
        throw new Error(`Unknown event type: ${job.eventType}`);
    }
  }
}

export const workflowService = new WorkflowService();