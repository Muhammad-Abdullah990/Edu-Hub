import { z } from "zod";

const uuidSchema = z.string().uuid();
const dateTimeString = z
  .string()
  .datetime()
  .or(z.string().refine((v) => !Number.isNaN(Date.parse(v))));

const tenantSchema = z
  .object({
    tenantId: uuidSchema,
  })
  .strict();

export const attendanceMarkedEventSchema = z
  .object({
    eventType: z.literal("ATTENDANCE_MARKED"),
    version: z.literal(1),
    eventId: uuidSchema,
    occurredAt: dateTimeString,
    actor: z
      .object({
        actorId: uuidSchema,
        actorRole: z.string().min(1).max(64).optional(),
      })
      .strict(),
    tenant: tenantSchema,
    payload: z
      .object({
        studentId: uuidSchema,
        attendanceDate: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
        status: z.enum(["present", "absent"]),
        markedByUserId: uuidSchema,
        classId: z.string().min(1).max(32),
        section: z.string().min(1).max(32).optional(),
      })
      .strict(),
  })
  .strict();

export const feePaidEventSchema = z
  .object({
    eventType: z.literal("FEE_PAID"),
    version: z.literal(1),
    eventId: uuidSchema,
    occurredAt: dateTimeString,
    actor: z
      .object({
        actorId: uuidSchema,
        actorRole: z.string().min(1).max(64).optional(),
      })
      .strict(),
    tenant: tenantSchema,
    payload: z
      .object({
        studentId: uuidSchema,
        feeRecordId: uuidSchema,
        paidAmount: z.number().int().nonnegative(),
        currency: z.string().min(1).max(8).default("INR"),
        paidAt: dateTimeString,
      })
      .strict(),
  })
  .strict();

export const reportGeneratedEventSchema = z
  .object({
    eventType: z.literal("REPORT_GENERATED"),
    version: z.literal(1),
    eventId: uuidSchema,
    occurredAt: dateTimeString,
    actor: z
      .object({
        actorId: uuidSchema,
        actorRole: z.string().min(1).max(64).optional(),
      })
      .strict(),
    tenant: tenantSchema,
    payload: z
      .object({
        studentId: uuidSchema,
        month: z.string().min(1).max(7),
        reportId: uuidSchema.optional(),
      })
      .strict(),
  })
  .strict();

export const performanceNoteAddedEventSchema = z
  .object({
    eventType: z.literal("PERFORMANCE_NOTE_ADDED"),
    version: z.literal(1),
    eventId: uuidSchema,
    occurredAt: dateTimeString,
    actor: z
      .object({
        actorId: uuidSchema,
        actorRole: z.string().min(1).max(64).optional(),
      })
      .strict(),
    tenant: tenantSchema,
    payload: z
      .object({
        studentId: uuidSchema,
        noteId: uuidSchema.optional(),
      })
      .strict(),
  })
  .strict();

export const parentNotificationSentEventSchema = z
  .object({
    eventType: z.literal("PARENT_NOTIFICATION_SENT"),
    version: z.literal(1),
    eventId: uuidSchema,
    occurredAt: dateTimeString,
    actor: z
      .object({
        actorId: uuidSchema,
        actorRole: z.string().min(1).max(64).optional(),
      })
      .strict(),
    tenant: tenantSchema,
    payload: z
      .object({
        studentId: uuidSchema,
        queueItemId: uuidSchema.optional(),
        channel: z.enum(["email", "sms", "whatsapp", "push"]).optional(),
      })
      .strict(),
  })
  .strict();

export const analyticsEventSchema = z.discriminatedUnion("eventType", [
  attendanceMarkedEventSchema,
  feePaidEventSchema,
  reportGeneratedEventSchema,
  performanceNoteAddedEventSchema,
  parentNotificationSentEventSchema,
]);

export type AnalyticsEvent = z.infer<typeof analyticsEventSchema>;
export type AttendanceMarkedEvent = z.infer<typeof attendanceMarkedEventSchema>;

export const analyticsEventTypes = [
  "ATTENDANCE_MARKED",
  "FEE_PAID",
  "REPORT_GENERATED",
  "PERFORMANCE_NOTE_ADDED",
  "PARENT_NOTIFICATION_SENT",
] as const;

