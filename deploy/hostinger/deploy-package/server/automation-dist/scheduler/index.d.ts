export declare class SchedulerService {
    private jobs;
    start(): Promise<void>;
    stop(): Promise<void>;
    private scheduleJob;
    private generateMonthlyReports;
    private generateFeeReminders;
    private generateAttendanceAlerts;
    /**
     * Check for fee reminders due based on 30-day cycle from admission date.
     * Students whose nextFeeDueDate is today or overdue will get a reminder.
     */
    private checkFeeRemindersDue;
    private getStudentsForMonthlyReports;
    private getDueFeeRecords;
    private getLowAttendanceStudents;
}
export declare const schedulerService: SchedulerService;
//# sourceMappingURL=index.d.ts.map