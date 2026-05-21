import * as cron from "node-cron";
import { eventService } from "../events";
import logger from "../logging";
import automationConfig from "../config";

export class SchedulerService {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  async start(): Promise<void> {
    logger.info("Starting scheduler service");

    // Monthly report generation - 1st of every month at 9 AM
    this.scheduleJob(
      "monthly-reports",
      automationConfig.scheduler.monthlyReportCron,
      this.generateMonthlyReports.bind(this)
    );

    // Fee reminders - every weekday at 10 AM
    this.scheduleJob(
      "fee-reminders",
      automationConfig.scheduler.feeReminderCron,
      this.generateFeeReminders.bind(this)
    );

    // Attendance alerts - every weekday at 8 AM
    this.scheduleJob(
      "attendance-alerts",
      automationConfig.scheduler.attendanceAlertCron,
      this.generateAttendanceAlerts.bind(this)
    );

    logger.info("Scheduler service started");
  }

  async stop(): Promise<void> {
    logger.info("Stopping scheduler service");

    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info({ jobName: name }, "Scheduled job stopped");
    }

    this.jobs.clear();
    logger.info("Scheduler service stopped");
  }

  private scheduleJob(name: string, cronExpression: string, handler: () => Promise<void>): void {
    try {
      const job = cron.schedule(cronExpression, async () => {
        try {
          logger.info({ jobName: name }, "Running scheduled job");
          await handler();
          logger.info({ jobName: name }, "Scheduled job completed");
        } catch (error) {
          logger.error({ error, jobName: name }, "Scheduled job failed");
        }
      });

      this.jobs.set(name, job);
      logger.info({ jobName: name, cronExpression }, "Job scheduled");
    } catch (error) {
      logger.error({ error, jobName: name, cronExpression }, "Failed to schedule job");
    }
  }

  private async generateMonthlyReports(): Promise<void> {
    // Get all students who need monthly reports
    const students = await this.getStudentsForMonthlyReports();

    for (const student of students) {
      try {
        const now = new Date();
        const month = now.toLocaleString("default", { month: "long" });
        const year = now.getFullYear();

        await eventService.triggerMonthlyReportReady(
          student.id,
          month,
          year
        );

        logger.info({ studentId: student.id }, "Monthly report event triggered");
      } catch (error) {
        logger.error({ error, studentId: student.id }, "Failed to trigger monthly report");
      }
    }
  }

  private async generateFeeReminders(): Promise<void> {
    // Get fee records that are due
    const dueFees = await this.getDueFeeRecords();

    for (const fee of dueFees) {
      try {
        await eventService.triggerFeeReminderDue(
          fee.studentId,
          fee.id,
          fee.dueDate,
          fee.amount
        );

        logger.info({ feeId: fee.id }, "Fee reminder event triggered");
      } catch (error) {
        logger.error({ error, feeId: fee.id }, "Failed to trigger fee reminder");
      }
    }
  }

  private async generateAttendanceAlerts(): Promise<void> {
    // Get students with low attendance
    const lowAttendanceStudents = await this.getLowAttendanceStudents();

    for (const student of lowAttendanceStudents) {
      try {
        const now = new Date();
        const month = now.toLocaleString("default", { month: "long" });

        await eventService.triggerAttendanceAlert(
          student.id,
          student.attendancePercentage,
          month
        );

        logger.info({ studentId: student.id }, "Attendance alert event triggered");
      } catch (error) {
        logger.error({ error, studentId: student.id }, "Failed to trigger attendance alert");
      }
    }
  }

  // Placeholder methods - would integrate with actual API/data fetching
  private async getStudentsForMonthlyReports(): Promise<Array<{ id: string }>> {
    // Mock data - replace with actual API call
    return [
      { id: "student-1" },
      { id: "student-2" },
    ];
  }

  private async getDueFeeRecords(): Promise<Array<{
    id: string;
    studentId: string;
    dueDate: string;
    amount: number;
  }>> {
    // Mock data - replace with actual API call
    return [
      {
        id: "fee-1",
        studentId: "student-1",
        dueDate: "2024-12-31",
        amount: 500,
      },
    ];
  }

  private async getLowAttendanceStudents(): Promise<Array<{
    id: string;
    attendancePercentage: number;
  }>> {
    // Mock data - replace with actual API call
    return [
      {
        id: "student-1",
        attendancePercentage: 65,
      },
    ];
  }
}

export const schedulerService = new SchedulerService();