import { pgTable, text, timestamp, uuid, jsonb, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./auth";
import { studentsTable, parentsTable } from "./school";

// Automation Jobs Table
export const automationJobsTable = pgTable(
  "automation_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    status: text("status").notNull(), // pending, generating, ready, failed, awaiting_manual_send, completed
    payload: jsonb("payload").notNull(),
    createdBy: uuid("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    processedAt: timestamp("processed_at"),
    failedAt: timestamp("failed_at"),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    statusIdx: index("automation_jobs_status_idx").on(table.status),
    eventTypeIdx: index("automation_jobs_event_type_idx").on(table.eventType),
    createdAtIdx: index("automation_jobs_created_at_idx").on(table.createdAt),
  })
);

// Communication Logs Table
export const communicationLogsTable = pgTable(
  "communication_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").references(() => automationJobsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").references(() => studentsTable.id),
    parentId: uuid("parent_id").references(() => parentsTable.id),
    channel: text("channel").notNull(), // whatsapp, email, sms
    recipient: text("recipient").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull(), // sent, failed, pending
    sentAt: timestamp("sent_at"),
    failedAt: timestamp("failed_at"),
    errorMessage: text("error_message"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("communication_logs_job_id_idx").on(table.jobId),
    studentIdIdx: index("communication_logs_student_id_idx").on(table.studentId),
    statusIdx: index("communication_logs_status_idx").on(table.status),
  })
);

// Generated Reports Table
export const generatedReportsTable = pgTable(
  "generated_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").references(() => automationJobsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").references(() => studentsTable.id),
    reportType: text("report_type").notNull(), // monthly, fee_reminder, etc.
    filePath: text("file_path").notNull(),
    fileName: text("file_name").notNull(),
    fileSize: integer("file_size"),
    checksum: text("checksum"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("generated_reports_job_id_idx").on(table.jobId),
    studentIdIdx: index("generated_reports_student_id_idx").on(table.studentId),
    reportTypeIdx: index("generated_reports_report_type_idx").on(table.reportType),
  })
);

// Message Drafts Table
export const messageDraftsTable = pgTable(
  "message_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id").references(() => automationJobsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").references(() => studentsTable.id),
    parentId: uuid("parent_id").references(() => parentsTable.id),
    channel: text("channel").notNull(),
    recipient: text("recipient").notNull(),
    subject: text("subject"),
    message: text("message").notNull(),
    attachments: jsonb("attachments"), // array of file paths
    status: text("status").notNull(), // draft, reviewed, sent
    reviewedBy: uuid("reviewed_by").references(() => usersTable.id),
    reviewedAt: timestamp("reviewed_at"),
    sentAt: timestamp("sent_at"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    jobIdIdx: index("message_drafts_job_id_idx").on(table.jobId),
    studentIdIdx: index("message_drafts_student_id_idx").on(table.studentId),
    statusIdx: index("message_drafts_status_idx").on(table.status),
  })
);

// Automation Events Table
export const automationEventsTable = pgTable(
  "automation_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventType: text("event_type").notNull(),
    entityType: text("entity_type").notNull(), // student, parent, fee, etc.
    entityId: uuid("entity_id").notNull(),
    payload: jsonb("payload").notNull(),
    triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
    processed: boolean("processed").default(false),
    processedAt: timestamp("processed_at"),
    metadata: jsonb("metadata"),
  },
  (table) => ({
    eventTypeIdx: index("automation_events_event_type_idx").on(table.eventType),
    entityTypeIdx: index("automation_events_entity_type_idx").on(table.entityType),
    processedIdx: index("automation_events_processed_idx").on(table.processed),
    triggeredAtIdx: index("automation_events_triggered_at_idx").on(table.triggeredAt),
  })
);

// Relations
export const automationJobsRelations = relations(automationJobsTable, ({ one, many }) => ({
  createdByUser: one(usersTable, {
    fields: [automationJobsTable.createdBy],
    references: [usersTable.id],
  }),
  communicationLogs: many(communicationLogsTable),
  generatedReports: many(generatedReportsTable),
  messageDrafts: many(messageDraftsTable),
}));

export const communicationLogsRelations = relations(communicationLogsTable, ({ one }) => ({
  job: one(automationJobsTable, {
    fields: [communicationLogsTable.jobId],
    references: [automationJobsTable.id],
  }),
  student: one(studentsTable, {
    fields: [communicationLogsTable.studentId],
    references: [studentsTable.id],
  }),
  parent: one(parentsTable, {
    fields: [communicationLogsTable.parentId],
    references: [parentsTable.id],
  }),
}));

export const generatedReportsRelations = relations(generatedReportsTable, ({ one }) => ({
  job: one(automationJobsTable, {
    fields: [generatedReportsTable.jobId],
    references: [automationJobsTable.id],
  }),
  student: one(studentsTable, {
    fields: [generatedReportsTable.studentId],
    references: [studentsTable.id],
  }),
}));

export const messageDraftsRelations = relations(messageDraftsTable, ({ one }) => ({
  job: one(automationJobsTable, {
    fields: [messageDraftsTable.jobId],
    references: [automationJobsTable.id],
  }),
  student: one(studentsTable, {
    fields: [messageDraftsTable.studentId],
    references: [studentsTable.id],
  }),
  parent: one(parentsTable, {
    fields: [messageDraftsTable.parentId],
    references: [parentsTable.id],
  }),
  reviewedByUser: one(usersTable, {
    fields: [messageDraftsTable.reviewedBy],
    references: [usersTable.id],
  }),
}));

export const automationEventsRelations = relations(automationEventsTable, ({}) => ({
  // No relations defined yet
}));