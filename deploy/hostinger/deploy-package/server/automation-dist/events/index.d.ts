import type { EventType, AutomationEvent } from "../types";
export declare class EventService {
    triggerEvent(eventType: EventType, entityType: string, entityId: string, payload: Record<string, unknown>): Promise<AutomationEvent>;
    processPendingEvents(): Promise<void>;
    triggerMonthlyReportReady(studentId: string, month: string, year: number): Promise<void>;
    triggerFeeReminderDue(studentId: string, feeRecordId: string, dueDate: string, amount: number): Promise<void>;
    triggerAttendanceAlert(studentId: string, attendancePercentage: number, month: string): Promise<void>;
    triggerPerformanceAlert(studentId: string, subject: string, grade: string, teacherNotes: string): Promise<void>;
    triggerCustomParentNotification(studentId: string, parentId: string, subject: string, message: string): Promise<void>;
}
export declare const eventService: EventService;
//# sourceMappingURL=index.d.ts.map