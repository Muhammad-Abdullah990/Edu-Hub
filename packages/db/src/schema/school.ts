import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { usersTable } from "./auth";

export const studentsTable = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentCode: varchar("student_code", { length: 64 }).notNull(),
    fullName: varchar("full_name", { length: 256 }).notNull(),
    class: varchar("class", { length: 32 }).notNull(),
    section: varchar("section", { length: 32 }).notNull(),
    dateOfBirth: date("date_of_birth").notNull(),
    admissionDate: date("admission_date").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("active"),
    photoUrl: text("photo_url").notNull(),
    isArchived: boolean("is_archived").notNull().default(false),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentCodeUniqueIndex: uniqueIndex("students_student_code_unique_idx").on(
      table.studentCode,
    ),
    studentNameIndex: index("students_full_name_idx").on(table.fullName),
    classIndex: index("students_class_idx").on(table.class),
    statusIndex: index("students_status_idx").on(table.status),
  }),
);

export const parentsTable = pgTable(
  "parents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 128 }).notNull(),
    phone: varchar("phone", { length: 32 }).notNull(),
    email: varchar("email", { length: 320 }),
    relationship: varchar("relationship", { length: 32 }).notNull(),
    address: text("address").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    parentPhoneIndex: index("parents_phone_idx").on(table.phone),
    parentEmailIndex: index("parents_email_idx").on(table.email),
  }),
);

export const studentParentsTable = pgTable(
  "student_parents",
  {
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    parentId: uuid("parent_id")
      .notNull()
      .references(() => parentsTable.id, { onDelete: "cascade" }),
    assignedAt: timestamp("assigned_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.studentId, table.parentId] }),
  }),
);

export const performanceNotesTable = pgTable(
  "performance_notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    note: text("note").notNull(),
    strengths: text("strengths").notNull(),
    weaknesses: text("weaknesses").notNull(),
    recommendations: text("recommendations").notNull(),
    behavioralNotes: text("behavioral_notes").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentIndex: index("performance_notes_student_idx").on(table.studentId),
    createdAtIndex: index("performance_notes_created_at_idx").on(
      table.createdAt,
    ),
  }),
);

export const progressReportsTable = pgTable(
  "progress_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    month: varchar("month", { length: 7 }).notNull(),
    teacherNote: text("teacher_note").notNull(),
    strengths: jsonb("strengths")
      .$type<string[]>()
      .notNull()
      .default([]),
    weaknesses: jsonb("weaknesses")
      .$type<string[]>()
      .notNull()
      .default([]),
    academicProgress: jsonb("academic_progress")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    status: varchar("status", { length: 16 }).notNull().default("pending"),
    generatedPdfPath: text("generated_pdf_path"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentMonthIdx: uniqueIndex("progress_reports_student_month_idx").on(
      table.studentId,
      table.month,
    ),
    studentIdx: index("progress_reports_student_idx").on(table.studentId),
  }),
);

export const attendanceTable = pgTable(
  "attendance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("present"),
    markedBy: uuid("marked_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    attendanceStudentDateIndex: uniqueIndex(
      "attendance_student_date_unique_idx",
    ).on(table.studentId, table.date),
    attendanceStudentIndex: index("attendance_student_idx").on(table.studentId),
    attendanceDateIndex: index("attendance_date_idx").on(table.date),
  }),
);

export const attendanceSummaryTable = pgTable(
  "attendance_summary",
  {
    studentId: uuid("student_id")
      .notNull()
      .primaryKey()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    attendancePercentage: integer("attendance_percentage").notNull().default(0),
    totalDays: integer("total_days").notNull().default(0),
    presentDays: integer("present_days").notNull().default(0),
    absentDays: integer("absent_days").notNull().default(0),
    lastRecordedAt: timestamp("last_recorded_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    attendanceStudentIndex: index("attendance_summary_student_idx").on(
      table.studentId,
    ),
  }),
);

export const feeStatusTable = pgTable(
  "fee_status",
  {
    studentId: uuid("student_id")
      .notNull()
      .primaryKey()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    outstandingAmount: integer("outstanding_amount").notNull().default(0),
    dueDate: date("due_date"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    feeStudentIndex: index("fee_status_student_idx").on(table.studentId),
  }),
);

export const feeRecordsTable = pgTable(
  "fee_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    amountDue: integer("amount_due").notNull().default(0),
    amountPaid: integer("amount_paid").notNull().default(0),
    currency: varchar("currency", { length: 8 }).notNull().default("INR"),
    dueDate: date("due_date").notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    feeRecordStudentIndex: index("fee_records_student_idx").on(
      table.studentId,
    ),
    feeRecordDueDateIndex: index("fee_records_due_date_idx").on(
      table.dueDate,
    ),
  }),
);

export const feeRemindersTable = pgTable(
  "fee_reminders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    feeRecordId: uuid("fee_record_id")
      .notNull()
      .references(() => feeRecordsTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    reminderDate: timestamp("reminder_date", { withTimezone: true })
      .defaultNow()
      .notNull(),
    channel: varchar("channel", { length: 32 }).notNull().default("email"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    feeReminderFeeRecordIndex: index(
      "fee_reminders_fee_record_idx",
    ).on(table.feeRecordId),
    feeReminderStudentIndex: index("fee_reminders_student_idx").on(
      table.studentId,
    ),
  }),
);

export const communicationQueueTable = pgTable(
  "communication_queue",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    subject: varchar("subject", { length: 256 }).notNull(),
    message: text("message").notNull(),
    channel: varchar("channel", { length: 32 }).notNull().default("email"),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    reviewStatus: varchar("review_status", { length: 32 })
      .notNull()
      .default("pending"),
    reviewedBy: uuid("reviewed_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => usersTable.id, {
      onDelete: "set null",
    }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    communicationQueueStudentIndex: index(
      "communication_queue_student_idx",
    ).on(table.studentId),
    communicationQueueStatusIndex: index(
      "communication_queue_status_idx",
    ).on(table.status),
  }),
);

export const notificationHistoryTable = pgTable(
  "notification_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    queueItemId: uuid("queue_item_id")
      .notNull()
      .references(() => communicationQueueTable.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 32 }).notNull(),
    recipient: varchar("recipient", { length: 320 }).notNull(),
    status: varchar("status", { length: 32 }).notNull().default("pending"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    response: text("response"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    notificationHistoryQueueIndex: index(
      "notification_history_queue_idx",
    ).on(table.queueItemId),
    notificationHistoryStudentIndex: index(
      "notification_history_student_idx",
    ).on(table.studentId),
  }),
);

export const studentsRelations = relations(studentsTable, ({ many, one }) => ({
  attendanceSummary: one(attendanceSummaryTable, {
    fields: [studentsTable.id],
    references: [attendanceSummaryTable.studentId],
  }),
  feeStatus: one(feeStatusTable, {
    fields: [studentsTable.id],
    references: [feeStatusTable.studentId],
  }),
  feeRecords: many(feeRecordsTable),
  feeReminders: many(feeRemindersTable),
  communicationQueue: many(communicationQueueTable),
  notificationHistory: many(notificationHistoryTable),
  performanceNotes: many(performanceNotesTable),
  attendances: many(attendanceTable),
  studentParents: many(studentParentsTable),
  progressReports: many(progressReportsTable),
}));

export const progressReportRelations = relations(progressReportsTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [progressReportsTable.studentId],
    references: [studentsTable.id],
  }),
}));

export const parentsRelations = relations(parentsTable, ({ many, one }) => ({
  studentParents: many(studentParentsTable),
  user: one(usersTable, {
    fields: [parentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const studentParentsRelations = relations(
  studentParentsTable,
  ({ one }) => ({
    student: one(studentsTable, {
      fields: [studentParentsTable.studentId],
      references: [studentsTable.id],
    }),
    parent: one(parentsTable, {
      fields: [studentParentsTable.parentId],
      references: [parentsTable.id],
    }),
  }),
);

export const performanceNotesRelations = relations(
  performanceNotesTable,
  ({ one }) => ({
    student: one(studentsTable, {
      fields: [performanceNotesTable.studentId],
      references: [studentsTable.id],
    }),
    author: one(usersTable, {
      fields: [performanceNotesTable.authorId],
      references: [usersTable.id],
    }),
  }),
);

export const attendanceRelations = relations(attendanceTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [attendanceTable.studentId],
    references: [studentsTable.id],
  }),
  author: one(usersTable, {
    fields: [attendanceTable.markedBy],
    references: [usersTable.id],
  }),
}));

export const attendanceSummaryRelations = relations(
  attendanceSummaryTable,
  ({ one }) => ({
    student: one(studentsTable, {
      fields: [attendanceSummaryTable.studentId],
      references: [studentsTable.id],
    }),
  }),
);

export const feeStatusRelations = relations(feeStatusTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [feeStatusTable.studentId],
    references: [studentsTable.id],
  }),
}));

export const feeRecordsRelations = relations(feeRecordsTable, ({ one, many }) => ({
  student: one(studentsTable, {
    fields: [feeRecordsTable.studentId],
    references: [studentsTable.id],
  }),
  reminders: many(feeRemindersTable),
}));

export const feeRemindersRelations = relations(feeRemindersTable, ({ one }) => ({
  student: one(studentsTable, {
    fields: [feeRemindersTable.studentId],
    references: [studentsTable.id],
  }),
  feeRecord: one(feeRecordsTable, {
    fields: [feeRemindersTable.feeRecordId],
    references: [feeRecordsTable.id],
  }),
}));

export const communicationQueueRelations = relations(
  communicationQueueTable,
  ({ one, many }) => ({
    student: one(studentsTable, {
      fields: [communicationQueueTable.studentId],
      references: [studentsTable.id],
    }),
    reviewer: one(usersTable, {
      fields: [communicationQueueTable.reviewedBy],
      references: [usersTable.id],
    }),
    notifications: many(notificationHistoryTable),
  }),
);

export const notificationHistoryRelations = relations(
  notificationHistoryTable,
  ({ one }) => ({
    student: one(studentsTable, {
      fields: [notificationHistoryTable.studentId],
      references: [studentsTable.id],
    }),
    queueItem: one(communicationQueueTable, {
      fields: [notificationHistoryTable.queueItemId],
      references: [communicationQueueTable.id],
    }),
  }),
);
