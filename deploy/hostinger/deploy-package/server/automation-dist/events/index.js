import { automationDb } from "../db";
import { queueService } from "../queues";
import { EventTypeSchema } from "../validation";
import logger from "../logging";
export class EventService {
    async triggerEvent(eventType, entityType, entityId, payload) {
        try {
            // Validate event type
            EventTypeSchema.parse(eventType);
            // Create event record
            const event = await automationDb.createAutomationEvent({
                eventType,
                entityType,
                entityId,
                payload,
            });
            // Enqueue job for processing
            await queueService.enqueue({
                eventType,
                payload: payload, // Type assertion needed due to discriminated union
            });
            logger.info({
                eventId: event.id,
                eventType,
                entityType,
                entityId
            }, "Event triggered and job enqueued");
            return event;
        }
        catch (error) {
            logger.error({ error, eventType, entityType, entityId }, "Failed to trigger event");
            throw error;
        }
    }
    async processPendingEvents() {
        try {
            const events = await automationDb.getUnprocessedEvents();
            for (const event of events) {
                try {
                    // Enqueue job if not already processed
                    await queueService.enqueue({
                        eventType: event.eventType,
                        payload: event.payload, // Type assertion needed due to discriminated union
                    });
                    // Mark event as processed
                    await automationDb.markEventProcessed(event.id);
                    logger.info({ eventId: event.id }, "Pending event processed");
                }
                catch (error) {
                    logger.error({ error, eventId: event.id }, "Failed to process pending event");
                }
            }
        }
        catch (error) {
            logger.error({ error }, "Failed to process pending events");
            throw error;
        }
    }
    // Specific event triggers
    async triggerMonthlyReportReady(studentId, month, year) {
        await this.triggerEvent("MONTHLY_REPORT_READY", "student", studentId, { studentId, month, year });
    }
    async triggerFeeReminderDue(studentId, feeRecordId, dueDate, amount) {
        await this.triggerEvent("FEE_REMINDER_DUE", "fee_record", feeRecordId, { studentId, feeRecordId, dueDate, amount });
    }
    async triggerAttendanceAlert(studentId, attendancePercentage, month) {
        await this.triggerEvent("ATTENDANCE_ALERT", "student", studentId, { studentId, attendancePercentage, month });
    }
    async triggerPerformanceAlert(studentId, subject, grade, teacherNotes) {
        await this.triggerEvent("PERFORMANCE_ALERT", "student", studentId, { studentId, subject, grade, teacherNotes });
    }
    async triggerCustomParentNotification(studentId, parentId, subject, message) {
        await this.triggerEvent("CUSTOM_PARENT_NOTIFICATION", "parent", parentId, { studentId, parentId, subject, message });
    }
}
export const eventService = new EventService();
//# sourceMappingURL=index.js.map