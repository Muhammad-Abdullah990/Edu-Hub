import { z } from "zod";

// Event Types
export const EventTypeSchema = z.enum([
  "MONTHLY_REPORT_READY",
  "FEE_REMINDER_DUE",
  "ATTENDANCE_ALERT",
  "PERFORMANCE_ALERT",
  "CUSTOM_PARENT_NOTIFICATION",
]);

export type EventType = z.infer<typeof EventTypeSchema>;

// Job Status
export const JobStatusSchema = z.enum([
  "pending",
  "generating",
  "ready",
  "failed",
  "awaiting_manual_send",
  "completed",
]);

export type JobStatus = z.infer<typeof JobStatusSchema>;

// Communication Channel
export const CommunicationChannelSchema = z.enum([
  "whatsapp",
  "email",
  "sms",
]);

export type CommunicationChannel = z.infer<typeof CommunicationChannelSchema>;

// Automation Job
export const AutomationJobSchema = z.object({
  id: z.string().uuid(),
  eventType: EventTypeSchema,
  status: JobStatusSchema,
  payload: z.record(z.unknown()),
  createdBy: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().optional(),
  failedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().int().min(0),
  metadata: z.record(z.unknown()).optional(),
});

export type AutomationJob = z.infer<typeof AutomationJobSchema>;

// Communication Log
export const CommunicationLogSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  channel: CommunicationChannelSchema,
  recipient: z.string(),
  message: z.string(),
  status: z.enum(["sent", "failed", "pending"]),
  sentAt: z.date().optional(),
  failedAt: z.date().optional(),
  errorMessage: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type CommunicationLog = z.infer<typeof CommunicationLogSchema>;

// Generated Report
export const GeneratedReportSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
  reportType: z.string(),
  filePath: z.string(),
  fileName: z.string(),
  fileSize: z.number().int().optional(),
  checksum: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
});

export type GeneratedReport = z.infer<typeof GeneratedReportSchema>;

// Message Draft
export const MessageDraftSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
  parentId: z.string().uuid().optional(),
  channel: CommunicationChannelSchema,
  recipient: z.string(),
  subject: z.string().optional(),
  message: z.string(),
  attachments: z.array(z.string()).optional(),
  status: z.enum(["draft", "reviewed", "sent"]),
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  sentAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type MessageDraft = z.infer<typeof MessageDraftSchema>;

// Automation Event
export const AutomationEventSchema = z.object({
  id: z.string().uuid(),
  eventType: EventTypeSchema,
  entityType: z.string(),
  entityId: z.string().uuid(),
  payload: z.record(z.unknown()),
  triggeredAt: z.date(),
  processed: z.boolean(),
  processedAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type AutomationEvent = z.infer<typeof AutomationEventSchema>;

// PDF Generation Payload
export const PDFGenerationPayloadSchema = z.object({
  studentId: z.string().uuid(),
  reportType: z.string(),
  data: z.record(z.unknown()),
  template: z.string(),
});

export type PDFGenerationPayload = z.infer<typeof PDFGenerationPayloadSchema>;

// WhatsApp Draft Payload
export const WhatsAppDraftPayloadSchema = z.object({
  recipient: z.string(),
  message: z.string(),
  attachments: z.array(z.string()).optional(),
});

export type WhatsAppDraftPayload = z.infer<typeof WhatsAppDraftPayloadSchema>;

// Queue Item
export const QueueItemSchema = z.object({
  id: z.string().uuid(),
  jobId: z.string().uuid(),
  eventType: EventTypeSchema,
  payload: z.record(z.unknown()),
  status: JobStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QueueItem = z.infer<typeof QueueItemSchema>;