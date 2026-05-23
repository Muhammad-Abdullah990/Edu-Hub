/**
 * Automation Scheduler
 * Handles background scheduling for fee reminders, report generation, etc.
 * Runs 30-day fee cycle checks and enqueues reminders
 */

import { logger } from "./logger";
import { db } from "@toppers/db";
import { studentsTable, feeRecordsTable, feeRemindersTable } from "@toppers/db";
import { and, eq, lte, gte, sql } from "drizzle-orm";
import { getAutomationService } from "./automation-service";

export class AutomationScheduler {
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;

  /**
   * Start the scheduler - runs checks every 6 hours
   */
  start(): void {
    if (this.running) return;
    this.running = true;

    logger.info("Automation scheduler started - checking fee cycles every 6 hours");

    // Run immediately on start
    void this.checkFeeCycles();
    void this.checkOverdueFees();
    void this.checkUpcomingReports();

    // Then every 6 hours
    this.intervalHandle = setInterval(() => {
      void this.checkFeeCycles();
      void this.checkOverdueFees();
      void this.checkUpcomingReports();
    }, 6 * 60 * 60 * 1000);
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    this.running = false;
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    logger.info("Automation scheduler stopped");
  }

  /**
   * Check fee cycles for students whose 30-day fee due date has arrived
   * Creates fee records and enqueues reminders
   */
  async checkFeeCycles(): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);

      // Find students whose next fee due date is today or past due (within 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      // Use Drizzle raw SQL with proper parameter binding
      const result = await db.execute(
        sql`SELECT id, student_code, full_name, monthly_fee_amount, 
                next_fee_due_date, fee_cycle_start_date
         FROM students 
         WHERE is_archived = false 
           AND next_fee_due_date IS NOT NULL 
           AND next_fee_due_date <= ${today}
           AND next_fee_due_date >= ${sevenDaysAgo}`,
      );

      const rows = Array.isArray(result.rows) ? result.rows : [];

      for (const row of rows) {
        try {
          const studentId = row.id as string;
          const monthlyFeeAmount = (row.monthly_fee_amount as number) || 0;
          const nextFeeDueDate = row.next_fee_due_date as string;

          // Check if fee record already exists for this period
          const existingRecord = await db
            .select({ id: feeRecordsTable.id })
            .from(feeRecordsTable)
            .where(
              and(
                eq(feeRecordsTable.studentId, studentId),
                eq(feeRecordsTable.dueDate, today),
              ),
            )
            .limit(1);

          if (existingRecord.length > 0) {
            continue; // Already have a record for today
          }

          // Create fee record for this cycle
          const [feeRecord] = await db
            .insert(feeRecordsTable)
            .values({
              studentId,
              description: `Monthly fee for ${today}`,
              amountDue: monthlyFeeAmount,
              amountPaid: 0,
              dueDate: today,
              status: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();

          // Calculate next due date (30 days from nextFeeDueDate)
          const nextDue = new Date(nextFeeDueDate);
          nextDue.setDate(nextDue.getDate() + 30);
          const nextDueDateStr = nextDue.toISOString().slice(0, 10);

          // Update student's next fee due date
          await db
            .update(studentsTable)
            .set({ nextFeeDueDate: nextDueDateStr, updatedAt: new Date() })
            .where(eq(studentsTable.id, studentId));

          // Create fee reminder
          await db.insert(feeRemindersTable).values({
            feeRecordId: feeRecord.id,
            studentId,
            reminderDate: new Date(),
            channel: "whatsapp",
            status: "pending",
            message: `Dear parent, your fee payment of Rs. ${monthlyFeeAmount} is due for ${row.full_name as string}. Please submit at the earliest.`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Enqueue automation workflow
          try {
            const automationService = getAutomationService();
            await automationService.prepareWhatsAppCommunication(
              "fee_reminder",
              studentId,
              "",
              {
                message: `Fee reminder: Rs. ${monthlyFeeAmount} due for ${row.full_name as string}. Due date: ${today}. Next cycle: ${nextDueDateStr}.`,
                templateData: {
                  studentName: row.full_name as string,
                  amount: monthlyFeeAmount,
                  dueDate: today,
                  nextDueDate: nextDueDateStr,
                },
              },
            );
          } catch (queueError) {
            logger.warn({ queueError, studentId }, "Failed to enqueue automation workflow");
          }

          logger.info(
            { studentId, amount: monthlyFeeAmount, dueDate: today, nextDueDate: nextDueDateStr },
            "Fee cycle processed - record created and reminder queued",
          );
        } catch (rowError) {
          logger.error({ rowError, studentId: row.id }, "Failed to process fee cycle for student");
        }
      }

      logger.info({ checkedCount: rows.length }, "Fee cycle check completed");
    } catch (error) {
      logger.error({ error }, "Fee cycle check failed");
    }
  }

  /**
   * Check for overdue fees and send additional reminders
   */
  async checkOverdueFees(): Promise<void> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      // Find all pending fee records past due
      const overdueRecords = await db
        .select({
          id: feeRecordsTable.id,
          studentId: feeRecordsTable.studentId,
          amountDue: feeRecordsTable.amountDue,
          dueDate: feeRecordsTable.dueDate,
        })
        .from(feeRecordsTable)
        .where(
          and(
            eq(feeRecordsTable.status, "pending"),
            lte(feeRecordsTable.dueDate, sevenDaysAgo),
          ),
        );

      for (const record of overdueRecords) {
        // Check if already reminded in last 3 days
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const recentReminders = await db
          .select({ id: feeRemindersTable.id })
          .from(feeRemindersTable)
          .where(
            and(
              eq(feeRemindersTable.feeRecordId, record.id),
              gte(feeRemindersTable.reminderDate, threeDaysAgo),
            ),
          )
          .limit(1);

        if (recentReminders.length > 0) continue;

        await db.insert(feeRemindersTable).values({
          feeRecordId: record.id,
          studentId: record.studentId,
          reminderDate: new Date(),
          channel: "whatsapp",
          status: "pending",
          message: `Reminder: Your fee of Rs. ${record.amountDue} is overdue since ${record.dueDate}. Please pay immediately to avoid any inconvenience.`,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } catch (error) {
      logger.error({ error }, "Overdue fee check failed");
    }
  }

  /**
   * Check for upcoming monthly reports that need generation
   */
  async checkUpcomingReports(): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 7);

      logger.debug(
        { currentMonth, nextMonth },
        "Report generation check completed (no automated scheduling yet)",
      );
    } catch (error) {
      logger.error({ error }, "Report generation check failed");
    }
  }

  isRunning(): boolean {
    return this.running;
  }
}

// Singleton instance
let schedulerInstance: AutomationScheduler | null = null;

export function getAutomationScheduler(): AutomationScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new AutomationScheduler();
  }
  return schedulerInstance;
}