import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { studentsTable } from "./school";

/**
 * Analytics foundation tables.
 * NOTE: These are append-only / snapshot oriented to preserve auditability.
 */

export const analyticsEventsTable = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventType: text("event_type").notNull(),
    version: integer("version").notNull().default(1),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull(),

    // Idempotency + replay safety
    eventIdempotencyKey: text("event_idempotency_key").notNull().unique(),

    // Optional: link to actor and source
    actorId: uuid("actor_id"),
    actorRole: text("actor_role"),

    // Multi-tenant future readiness
    tenantId: uuid("tenant_id").notNull(),

    // Validated event payload
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),

    // Processing status
    processingStatus: text("processing_status")
      .notNull()
      .default("queued"),
    processedAt: timestamp("processed_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    typeIdx: index("analytics_events_type_idx").on(table.eventType),
    occurredIdx: index("analytics_events_occurred_idx").on(table.occurredAt),
    tenantIdx: index("analytics_events_tenant_idx").on(table.tenantId),
  }),
);

export const analyticsSnapshotsTable = pgTable(
  "analytics_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    domain: text("domain").notNull(),
    studentId: uuid("student_id").references(() => studentsTable.id, {
      onDelete: "cascade",
    }),
    classId: text("class_id"),
    section: text("section"),
    snapshotPeriod: text("snapshot_period").notNull(),

    // Used to ensure snapshot versions are immutable
    snapshotKey: text("snapshot_key").notNull(),

    generatedAt: timestamp("generated_at", { withTimezone: true })
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    checksum: text("checksum"),

    // AI readiness flags
    isFinal: boolean("is_final").notNull().default(true),
    version: integer("version").notNull().default(1),
  },
  (table) => ({
    domainIdx: index("analytics_snapshots_domain_idx").on(table.domain),
    studentIdx: index("analytics_snapshots_student_idx").on(table.studentId),
    periodIdx: index("analytics_snapshots_period_idx").on(
      table.snapshotPeriod,
    ),
    snapshotKeyUniq: uniqueIndex("analytics_snapshots_key_uniq").on(
      table.snapshotKey,
    ),
  }),
);

export const studentScoresTable = pgTable(
  "student_scores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    domain: text("domain").notNull(),

    scorePeriod: text("score_period").notNull(),
    scoreValue: integer("score_value").notNull(),
    maxScore: integer("max_score").notNull().default(100),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    breakdown: jsonb("breakdown").$type<Record<string, unknown>>().notNull(),
    algorithm: text("algorithm").notNull().default("rule_based_v1"),
  },
  (table) => ({
    studentDomainIdx: index("student_scores_student_domain_idx").on(
      table.studentId,
      table.domain,
    ),
    periodIdx: index("student_scores_period_idx").on(table.scorePeriod),
    uniqScore: uniqueIndex("student_scores_uniq").on(
      table.studentId,
      table.domain,
      table.scorePeriod,
    ),
  }),
);

export const studentRiskProfilesTable = pgTable(
  "student_risk_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),

    riskPeriod: text("risk_period").notNull(),
    overallRiskScore: integer("overall_risk_score").notNull(),
    riskLevel: text("risk_level").notNull(),

    // Components for auditability
    components: jsonb("components")
      .$type<Record<string, unknown>>()
      .notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    algorithm: text("algorithm").notNull().default("rule_based_v1"),
  },
  (table) => ({
    studentRiskIdx: index("student_risk_student_idx").on(table.studentId),
    uniqRisk: uniqueIndex("student_risk_uniq").on(
      table.studentId,
      table.riskPeriod,
    ),
  }),
);

export const attendanceAggregatesTable = pgTable(
  "attendance_aggregates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),

    classId: text("class_id").notNull(),
    section: text("section"),

    aggregatePeriod: text("aggregate_period").notNull(), // YYYY-MM

    presentDays: integer("present_days").notNull().default(0),
    absentDays: integer("absent_days").notNull().default(0),
    attendancePercentage: integer("attendance_percentage").notNull().default(0),

    trend: jsonb("trend").$type<Record<string, unknown>>().notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    algorithm: text("algorithm").notNull().default("rule_based_v1"),
  },
  (table) => ({
    studentPeriodUniq: uniqueIndex("attendance_agg_student_period_uniq").on(
      table.studentId,
      table.aggregatePeriod,
    ),
    studentAggIdx: index("attendance_agg_student_idx").on(
      table.studentId,
    ),
    periodIdx: index("attendance_agg_period_idx").on(table.aggregatePeriod),
  }),
);

export const feeAggregatesTable = pgTable(
  "fee_aggregates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    aggregatePeriod: text("aggregate_period").notNull(),

    recoveredAmount: integer("recovered_amount").notNull().default(0),
    outstandingAmount: integer("outstanding_amount").notNull().default(0),
    recoveryRate: integer("recovery_rate").notNull().default(0),

    trend: jsonb("trend").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentPeriodUniq: uniqueIndex("fee_agg_student_period_uniq").on(
      table.studentId,
      table.aggregatePeriod,
    ),
    studentAggIdx: index("fee_agg_student_idx").on(table.studentId),
    periodIdx: index("fee_agg_period_idx").on(table.aggregatePeriod),
  }),
);

export const engagementMetricsTable = pgTable(
  "engagement_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => studentsTable.id, { onDelete: "cascade" }),
    aggregatePeriod: text("aggregate_period").notNull(),

    reportViews: integer("report_views").notNull().default(0),
    responses: integer("responses").notNull().default(0),
    engagementScore: integer("engagement_score").notNull().default(0),

    trend: jsonb("trend").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    studentPeriodUniq: uniqueIndex("engagement_student_period_uniq").on(
      table.studentId,
      table.aggregatePeriod,
    ),
    studentAggIdx: index("engagement_student_idx").on(table.studentId),
    periodIdx: index("engagement_period_idx").on(table.aggregatePeriod),
  }),
);

export const institutionMetricsTable = pgTable(
  "institution_metrics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    metricPeriod: text("metric_period").notNull(),

    atRiskCount: integer("at_risk_count").notNull().default(0),
    avgAttendance: integer("avg_attendance").notNull().default(0),

    data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tenantPeriodUniq: uniqueIndex("institution_metrics_tenant_period_uniq").on(
      table.tenantId,
      table.metricPeriod,
    ),
    tenantIdx: index("institution_metrics_tenant_idx").on(table.tenantId),
  }),
);

export const aiGeneratedSummariesTable = pgTable(
  "ai_generated_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    domain: text("domain").notNull(),

    targetStudentId: uuid("target_student_id").references(() => studentsTable.id, {
      onDelete: "set null",
    }),

    period: text("period"),
    dataset: jsonb("dataset").$type<Record<string, unknown>>().notNull(),
    output: jsonb("output").$type<Record<string, unknown>>().notNull(),

    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    createdBy: uuid("created_by"),
    reviewedBy: uuid("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),

    audit: jsonb("audit").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    tenantIdx: index("ai_summaries_tenant_idx").on(table.tenantId),
    domainIdx: index("ai_summaries_domain_idx").on(table.domain),
  }),
);

export const predictionLogsTable = pgTable(
  "prediction_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tenantId: uuid("tenant_id").notNull(),
    domain: text("domain").notNull(),
    targetStudentId: uuid("target_student_id").references(() => studentsTable.id, {
      onDelete: "set null",
    }),

    period: text("period"),
    modelName: text("model_name").notNull().default("future_model"),

    inputDataset: jsonb("input_dataset")
      .$type<Record<string, unknown>>()
      .notNull(),

    prediction: jsonb("prediction")
      .$type<Record<string, unknown>>()
      .notNull(),

    status: text("status").notNull().default("completed"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    errorMessage: text("error_message"),
  },
  (table) => ({
    tenantIdx: index("prediction_logs_tenant_idx").on(table.tenantId),
    domainIdx: index("prediction_logs_domain_idx").on(table.domain),
    studentIdx: index("prediction_logs_student_idx").on(table.targetStudentId),
  }),
);

// Relations (minimal for now)
export const analyticsSnapshotsRelations = relations(
  analyticsSnapshotsTable,
  ({ one }) => ({
    student: one(studentsTable, {
      fields: [analyticsSnapshotsTable.studentId],
      references: [studentsTable.id],
    }),
  }),
);

