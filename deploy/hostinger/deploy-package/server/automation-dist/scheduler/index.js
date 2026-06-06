import * as cron from "node-cron";
import { eventService } from "../events";
import logger from "../logging";
import automationConfig from "../config";
export class SchedulerService {
    jobs = new Map();
    async start() {
        logger.info("Starting scheduler service");
        // Monthly report generation - 1st of every month at 9 AM
        this.scheduleJob("monthly-reports", automationConfig.scheduler.monthlyReportCron, this.generateMonthlyReports.bind(this));
        // Fee reminders based on 30-day admission cycle - every weekday at 10 AM
        this.scheduleJob("fee-reminders", automationConfig.scheduler.feeReminderCron, this.generateFeeReminders.bind(this));
        // Attendance alerts - every weekday at 8 AM
        this.scheduleJob("attendance-alerts", automationConfig.scheduler.attendanceAlertCron, this.generateAttendanceAlerts.bind(this));
        // Daily fee reminder due check at 6 AM (checks 30-day cycle)
        this.scheduleJob("fee-reminder-due-check", "0 6 * * *", this.checkFeeRemindersDue.bind(this));
        logger.info("Scheduler service started");
    }
    async stop() {
        logger.info("Stopping scheduler service");
        for (const [name, job] of this.jobs) {
            job.stop();
            logger.info({ jobName: name }, "Scheduled job stopped");
        }
        this.jobs.clear();
        logger.info("Scheduler service stopped");
    }
    scheduleJob(name, cronExpression, handler) {
        try {
            const job = cron.schedule(cronExpression, async () => {
                try {
                    logger.info({ jobName: name }, "Running scheduled job");
                    await handler();
                    logger.info({ jobName: name }, "Scheduled job completed");
                }
                catch (error) {
                    logger.error({ error, jobName: name }, "Scheduled job failed");
                }
            });
            this.jobs.set(name, job);
            logger.info({ jobName: name, cronExpression }, "Job scheduled");
        }
        catch (error) {
            logger.error({ error, jobName: name, cronExpression }, "Failed to schedule job");
        }
    }
    async generateMonthlyReports() {
        // Get all students who need monthly reports
        const students = await this.getStudentsForMonthlyReports();
        for (const student of students) {
            try {
                const now = new Date();
                const month = now.toLocaleString("default", { month: "long" });
                const year = now.getFullYear();
                await eventService.triggerMonthlyReportReady(student.id, month, year);
                logger.info({ studentId: student.id }, "Monthly report event triggered");
            }
            catch (error) {
                logger.error({ error, studentId: student.id }, "Failed to trigger monthly report");
            }
        }
    }
    async generateFeeReminders() {
        // Get fee records that are due
        const dueFees = await this.getDueFeeRecords();
        for (const fee of dueFees) {
            try {
                await eventService.triggerFeeReminderDue(fee.studentId, fee.id, fee.dueDate, fee.amount);
                logger.info({ feeId: fee.id }, "Fee reminder event triggered");
            }
            catch (error) {
                logger.error({ error, feeId: fee.id }, "Failed to trigger fee reminder");
            }
        }
    }
    async generateAttendanceAlerts() {
        // Get students with low attendance
        const lowAttendanceStudents = await this.getLowAttendanceStudents();
        for (const student of lowAttendanceStudents) {
            try {
                const now = new Date();
                const month = now.toLocaleString("default", { month: "long" });
                await eventService.triggerAttendanceAlert(student.id, student.attendancePercentage, month);
                logger.info({ studentId: student.id }, "Attendance alert event triggered");
            }
            catch (error) {
                logger.error({ error, studentId: student.id }, "Failed to trigger attendance alert");
            }
        }
    }
    /**
     * Check for fee reminders due based on 30-day cycle from admission date.
     * Students whose nextFeeDueDate is today or overdue will get a reminder.
     */
    async checkFeeRemindersDue() {
        try {
            const { db, studentsTable } = await import("@toppers/db");
            const { eq, lte, gte, and, sql } = await import("drizzle-orm");
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            // Find students where nextFeeDueDate is today or overdue (within last 3 days)
            // and they have an active status, have a fee cycle start date
            const students = await db
                .select({
                id: studentsTable.id,
                fullName: studentsTable.fullName,
                admissionDate: studentsTable.admissionDate,
                nextFeeDueDate: studentsTable.nextFeeDueDate,
                monthlyFeeAmount: studentsTable.monthlyFeeAmount,
                feeCycleStartDate: studentsTable.feeCycleStartDate,
            })
                .from(studentsTable)
                .where(and(eq(studentsTable.isArchived, false), eq(studentsTable.status, "active"), 
            // nextFeeDueDate is today or overdue (up to 3 days)
            lte(studentsTable.nextFeeDueDate, todayStr), gte(studentsTable.nextFeeDueDate, sql `${todayStr}::date - interval '3 days'`)));
            for (const student of students) {
                if (!student.nextFeeDueDate)
                    continue;
                try {
                    // Trigger fee reminder event for this student
                    await eventService.triggerFeeReminderDue(student.id, student.id, // Using student ID as fee record reference
                    student.nextFeeDueDate, student.monthlyFeeAmount);
                    logger.info({
                        studentId: student.id,
                        dueDate: student.nextFeeDueDate
                    }, "Fee reminder due check triggered");
                }
                catch (error) {
                    logger.error({ error, studentId: student.id }, "Failed to trigger fee reminder for student");
                }
            }
            logger.info({ checkedCount: students.length }, "Fee reminder due check completed");
        }
        catch (error) {
            logger.error({ error }, "Fee reminder due check failed");
        }
    }
    // Placeholder methods - would integrate with actual API/data fetching
    async getStudentsForMonthlyReports() {
        try {
            const { db, studentsTable } = await import("@toppers/db");
            const { eq } = await import("drizzle-orm");
            const students = await db
                .select({ id: studentsTable.id })
                .from(studentsTable)
                .where(eq(studentsTable.isArchived, false));
            return students;
        }
        catch (error) {
            logger.error({ error }, "Failed to get students for monthly reports");
            return [];
        }
    }
    async getDueFeeRecords() {
        try {
            const { db, feeRecordsTable, studentsTable } = await import("@toppers/db");
            const { eq, and, lte } = await import("drizzle-orm");
            const today = new Date().toISOString().split('T')[0];
            const records = await db
                .select({
                id: feeRecordsTable.id,
                studentId: feeRecordsTable.studentId,
                dueDate: feeRecordsTable.dueDate,
                amount: feeRecordsTable.amountDue,
            })
                .from(feeRecordsTable)
                .where(and(eq(feeRecordsTable.status, "pending"), lte(feeRecordsTable.dueDate, today)));
            return records;
        }
        catch (error) {
            logger.error({ error }, "Failed to get due fee records");
            return [];
        }
    }
    async getLowAttendanceStudents() {
        try {
            const { db, attendanceSummaryTable, studentsTable } = await import("@toppers/db");
            const { eq, and, lt } = await import("drizzle-orm");
            const students = await db
                .select({
                id: attendanceSummaryTable.studentId,
                attendancePercentage: attendanceSummaryTable.attendancePercentage,
            })
                .from(attendanceSummaryTable)
                .innerJoin(studentsTable, eq(attendanceSummaryTable.studentId, studentsTable.id))
                .where(and(eq(studentsTable.isArchived, false), lt(attendanceSummaryTable.attendancePercentage, 75)));
            return students;
        }
        catch (error) {
            logger.error({ error }, "Failed to get low attendance students");
            return [];
        }
    }
}
export const schedulerService = new SchedulerService();
//# sourceMappingURL=index.js.map