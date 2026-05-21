import {
  attendanceMarkedEventSchema,
  feePaidEventSchema,
  performanceNoteAddedEventSchema,
  parentNotificationSentEventSchema,
  reportGeneratedEventSchema,
} from "@toppers/validations";

export const analyticsEventSchemaRegistry = {
  ATTENDANCE_MARKED: attendanceMarkedEventSchema,
  FEE_PAID: feePaidEventSchema,
  REPORT_GENERATED: reportGeneratedEventSchema,
  PERFORMANCE_NOTE_ADDED: performanceNoteAddedEventSchema,
  PARENT_NOTIFICATION_SENT: parentNotificationSentEventSchema,
} as const;

