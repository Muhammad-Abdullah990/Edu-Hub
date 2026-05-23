-- ============================================================================
-- TOPPERS COACHING - COMPLETE DATABASE SCHEMA
-- Run this on Supabase SQL Editor
-- ============================================================================
-- This creates ALL tables needed by the system from scratch.
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================================

-- ============================================================================
-- 1. AUTH / USER TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(64) NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name varchar(128) NOT NULL UNIQUE,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(128) NOT NULL,
  email varchar(320) NOT NULL,
  password_hash text NOT NULL,
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status varchar(16) NOT NULL DEFAULT 'active',
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role_id);
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);

CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id integer NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id integer NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  device_info text,
  ip_address varchar(64),
  user_agent text,
  last_used_at timestamp with time zone DEFAULT now() NOT NULL,
  revoked_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(128) NOT NULL,
  entity_type varchar(128) NOT NULL,
  entity_id varchar(128),
  timestamp timestamp with time zone DEFAULT now() NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS audit_logs_user_idx ON audit_logs (user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON audit_logs (action);
CREATE INDEX IF NOT EXISTS audit_logs_timestamp_idx ON audit_logs (timestamp);

-- ============================================================================
-- 2. SCHOOL / STUDENT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_code varchar(64) NOT NULL,
  full_name varchar(256) NOT NULL,
  class varchar(32) NOT NULL,
  section varchar(32) NOT NULL,
  date_of_birth date NOT NULL,
  admission_date date NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'active',
  photo_url text NOT NULL,
  portal_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  monthly_fee_amount integer NOT NULL DEFAULT 0,
  fee_cycle_start_date date,
  next_fee_due_date date,
  parent_contact varchar(32),
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS students_student_code_unique_idx ON students (student_code);
CREATE INDEX IF NOT EXISTS students_full_name_idx ON students (full_name);
CREATE INDEX IF NOT EXISTS students_class_idx ON students (class);
CREATE INDEX IF NOT EXISTS students_status_idx ON students (status);
CREATE UNIQUE INDEX IF NOT EXISTS students_portal_user_id_unique_idx ON students (portal_user_id) WHERE portal_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS students_next_fee_due_date_idx ON students (next_fee_due_date) WHERE next_fee_due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS students_fee_cycle_start_idx ON students (fee_cycle_start_date) WHERE fee_cycle_start_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS students_parent_contact_idx ON students (parent_contact) WHERE parent_contact IS NOT NULL;

CREATE TABLE IF NOT EXISTS parents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name varchar(128) NOT NULL,
  phone varchar(32) NOT NULL,
  email varchar(320),
  relationship varchar(32) NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS parents_phone_idx ON parents (phone);
CREATE INDEX IF NOT EXISTS parents_email_idx ON parents (email);

CREATE TABLE IF NOT EXISTS student_parents (
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  assigned_at timestamp with time zone DEFAULT now() NOT NULL,
  PRIMARY KEY (student_id, parent_id)
);

CREATE TABLE IF NOT EXISTS performance_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  author_id uuid REFERENCES users(id) ON DELETE SET NULL,
  note text NOT NULL,
  strengths text NOT NULL,
  weaknesses text NOT NULL,
  recommendations text NOT NULL,
  behavioral_notes text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS performance_notes_student_idx ON performance_notes (student_id);
CREATE INDEX IF NOT EXISTS performance_notes_created_at_idx ON performance_notes (created_at);

CREATE TABLE IF NOT EXISTS progress_reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  month varchar(7) NOT NULL,
  teacher_note text NOT NULL,
  strengths jsonb NOT NULL DEFAULT '[]',
  weaknesses jsonb NOT NULL DEFAULT '[]',
  academic_progress jsonb NOT NULL DEFAULT '{}',
  status varchar(16) NOT NULL DEFAULT 'pending',
  generated_pdf_path text,
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS progress_reports_student_month_idx ON progress_reports (student_id, month);
CREATE INDEX IF NOT EXISTS progress_reports_student_idx ON progress_reports (student_id);

-- ============================================================================
-- 3. ATTENDANCE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date date NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'present',
  marked_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_student_date_unique_idx ON attendance (student_id, date);
CREATE INDEX IF NOT EXISTS attendance_student_idx ON attendance (student_id);
CREATE INDEX IF NOT EXISTS attendance_date_idx ON attendance (date);

CREATE TABLE IF NOT EXISTS attendance_summary (
  student_id uuid NOT NULL PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  attendance_percentage integer NOT NULL DEFAULT 0,
  total_days integer NOT NULL DEFAULT 0,
  present_days integer NOT NULL DEFAULT 0,
  absent_days integer NOT NULL DEFAULT 0,
  leave_days integer NOT NULL DEFAULT 0,
  last_recorded_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS attendance_summary_student_idx ON attendance_summary (student_id);

CREATE TABLE IF NOT EXISTS attendance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendance(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  old_status varchar(32),
  new_status varchar(32) NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS attendance_audit_student_idx ON attendance_audit (student_id);
CREATE INDEX IF NOT EXISTS attendance_audit_date_idx ON attendance_audit (changed_at);

-- ============================================================================
-- 4. FEE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS fee_status (
  student_id uuid NOT NULL PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
  status varchar(32) NOT NULL DEFAULT 'pending',
  outstanding_amount integer NOT NULL DEFAULT 0,
  due_date date,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS fee_status_student_idx ON fee_status (student_id);

CREATE TABLE IF NOT EXISTS fee_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_due integer NOT NULL DEFAULT 0,
  amount_paid integer NOT NULL DEFAULT 0,
  currency varchar(8) NOT NULL DEFAULT 'INR',
  due_date date NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS fee_records_student_idx ON fee_records (student_id);
CREATE INDEX IF NOT EXISTS fee_records_due_date_idx ON fee_records (due_date);

CREATE TABLE IF NOT EXISTS fee_reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  fee_record_id uuid NOT NULL REFERENCES fee_records(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  reminder_date timestamp with time zone DEFAULT now() NOT NULL,
  channel varchar(32) NOT NULL DEFAULT 'email',
  status varchar(32) NOT NULL DEFAULT 'pending',
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS fee_reminders_fee_record_idx ON fee_reminders (fee_record_id);
CREATE INDEX IF NOT EXISTS fee_reminders_student_idx ON fee_reminders (student_id);

-- ============================================================================
-- 5. COMMUNICATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS communication_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject varchar(256) NOT NULL,
  message text NOT NULL,
  channel varchar(32) NOT NULL DEFAULT 'email',
  status varchar(32) NOT NULL DEFAULT 'pending',
  review_status varchar(32) NOT NULL DEFAULT 'pending',
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamp with time zone,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  scheduled_at timestamp with time zone,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS communication_queue_student_idx ON communication_queue (student_id);
CREATE INDEX IF NOT EXISTS communication_queue_status_idx ON communication_queue (status);

CREATE TABLE IF NOT EXISTS notification_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  queue_item_id uuid NOT NULL REFERENCES communication_queue(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  channel varchar(32) NOT NULL,
  recipient varchar(320) NOT NULL,
  status varchar(32) NOT NULL DEFAULT 'pending',
  sent_at timestamp with time zone,
  response text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS notification_history_queue_idx ON notification_history (queue_item_id);
CREATE INDEX IF NOT EXISTS notification_history_student_idx ON notification_history (student_id);

-- ============================================================================
-- 6. AUTOMATION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  status text NOT NULL,
  payload jsonb NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  processed_at timestamp with time zone,
  failed_at timestamp with time zone,
  error_message text,
  retry_count integer DEFAULT 0,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS automation_jobs_status_idx ON automation_jobs (status);
CREATE INDEX IF NOT EXISTS automation_jobs_event_type_idx ON automation_jobs (event_type);
CREATE INDEX IF NOT EXISTS automation_jobs_created_at_idx ON automation_jobs (created_at);

CREATE TABLE IF NOT EXISTS communication_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES automation_jobs(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id),
  parent_id uuid REFERENCES parents(id),
  channel text NOT NULL,
  recipient text NOT NULL,
  message text NOT NULL,
  status text NOT NULL,
  sent_at timestamp with time zone,
  failed_at timestamp with time zone,
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS communication_logs_job_id_idx ON communication_logs (job_id);
CREATE INDEX IF NOT EXISTS communication_logs_student_id_idx ON communication_logs (student_id);
CREATE INDEX IF NOT EXISTS communication_logs_status_idx ON communication_logs (status);

CREATE TABLE IF NOT EXISTS generated_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES automation_jobs(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id),
  report_type text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size integer,
  checksum text,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS generated_reports_job_id_idx ON generated_reports (job_id);
CREATE INDEX IF NOT EXISTS generated_reports_student_id_idx ON generated_reports (student_id);
CREATE INDEX IF NOT EXISTS generated_reports_report_type_idx ON generated_reports (report_type);

CREATE TABLE IF NOT EXISTS message_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES automation_jobs(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id),
  parent_id uuid REFERENCES parents(id),
  channel text NOT NULL,
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  attachments jsonb,
  status text NOT NULL DEFAULT 'draft',
  reviewed_by uuid REFERENCES users(id),
  reviewed_at timestamp with time zone,
  sent_at timestamp with time zone,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS message_drafts_job_id_idx ON message_drafts (job_id);
CREATE INDEX IF NOT EXISTS message_drafts_student_id_idx ON message_drafts (student_id);
CREATE INDEX IF NOT EXISTS message_drafts_status_idx ON message_drafts (status);

CREATE TABLE IF NOT EXISTS automation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  payload jsonb NOT NULL,
  triggered_at timestamp with time zone DEFAULT now() NOT NULL,
  processed boolean DEFAULT false,
  processed_at timestamp with time zone,
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS automation_events_event_type_idx ON automation_events (event_type);
CREATE INDEX IF NOT EXISTS automation_events_entity_type_idx ON automation_events (entity_type);
CREATE INDEX IF NOT EXISTS automation_events_processed_idx ON automation_events (processed);
CREATE INDEX IF NOT EXISTS automation_events_triggered_at_idx ON automation_events (triggered_at);

-- ============================================================================
-- 7. ANALYTICS TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  occurred_at timestamp with time zone NOT NULL,
  event_idempotency_key text NOT NULL UNIQUE,
  actor_id uuid,
  actor_role text,
  tenant_id uuid NOT NULL,
  payload jsonb NOT NULL,
  processing_status text NOT NULL DEFAULT 'queued',
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS analytics_events_type_idx ON analytics_events (event_type);
CREATE INDEX IF NOT EXISTS analytics_events_occurred_idx ON analytics_events (occurred_at);
CREATE INDEX IF NOT EXISTS analytics_events_tenant_idx ON analytics_events (tenant_id);

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  domain text NOT NULL,
  tenant_id uuid NOT NULL,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  class_id text,
  section text,
  snapshot_period text NOT NULL,
  snapshot_key text NOT NULL,
  generated_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  data jsonb NOT NULL,
  checksum text,
  is_final boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS analytics_snapshots_domain_idx ON analytics_snapshots (domain);
CREATE INDEX IF NOT EXISTS analytics_snapshots_student_idx ON analytics_snapshots (student_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_tenant_idx ON analytics_snapshots (tenant_id);
CREATE INDEX IF NOT EXISTS analytics_snapshots_period_idx ON analytics_snapshots (snapshot_period);
CREATE UNIQUE INDEX IF NOT EXISTS analytics_snapshots_key_uniq ON analytics_snapshots (snapshot_key);

CREATE TABLE IF NOT EXISTS student_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  domain text NOT NULL,
  score_period text NOT NULL,
  score_value integer NOT NULL,
  max_score integer NOT NULL DEFAULT 100,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  breakdown jsonb NOT NULL,
  algorithm text NOT NULL DEFAULT 'rule_based_v1'
);

CREATE INDEX IF NOT EXISTS student_scores_student_domain_idx ON student_scores (student_id, domain);
CREATE INDEX IF NOT EXISTS student_scores_period_idx ON student_scores (score_period);
CREATE UNIQUE INDEX IF NOT EXISTS student_scores_uniq ON student_scores (student_id, domain, score_period);

CREATE TABLE IF NOT EXISTS student_risk_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  risk_period text NOT NULL,
  overall_risk_score integer NOT NULL,
  risk_level text NOT NULL,
  components jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  algorithm text NOT NULL DEFAULT 'rule_based_v1'
);

CREATE INDEX IF NOT EXISTS student_risk_student_idx ON student_risk_profiles (student_id);
CREATE UNIQUE INDEX IF NOT EXISTS student_risk_uniq ON student_risk_profiles (student_id, risk_period);

CREATE TABLE IF NOT EXISTS attendance_aggregates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id text NOT NULL,
  section text,
  aggregate_period text NOT NULL,
  present_days integer NOT NULL DEFAULT 0,
  absent_days integer NOT NULL DEFAULT 0,
  attendance_percentage integer NOT NULL DEFAULT 0,
  trend jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  algorithm text NOT NULL DEFAULT 'rule_based_v1'
);

CREATE UNIQUE INDEX IF NOT EXISTS attendance_agg_student_period_uniq ON attendance_aggregates (student_id, aggregate_period);
CREATE INDEX IF NOT EXISTS attendance_agg_student_idx ON attendance_aggregates (student_id);
CREATE INDEX IF NOT EXISTS attendance_agg_period_idx ON attendance_aggregates (aggregate_period);

CREATE TABLE IF NOT EXISTS fee_aggregates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  aggregate_period text NOT NULL,
  recovered_amount integer NOT NULL DEFAULT 0,
  outstanding_amount integer NOT NULL DEFAULT 0,
  recovery_rate integer NOT NULL DEFAULT 0,
  trend jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS fee_agg_student_period_uniq ON fee_aggregates (student_id, aggregate_period);
CREATE INDEX IF NOT EXISTS fee_agg_student_idx ON fee_aggregates (student_id);
CREATE INDEX IF NOT EXISTS fee_agg_period_idx ON fee_aggregates (aggregate_period);

CREATE TABLE IF NOT EXISTS engagement_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  aggregate_period text NOT NULL,
  report_views integer NOT NULL DEFAULT 0,
  responses integer NOT NULL DEFAULT 0,
  engagement_score integer NOT NULL DEFAULT 0,
  trend jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS engagement_student_period_uniq ON engagement_metrics (student_id, aggregate_period);
CREATE INDEX IF NOT EXISTS engagement_student_idx ON engagement_metrics (student_id);
CREATE INDEX IF NOT EXISTS engagement_period_idx ON engagement_metrics (aggregate_period);

CREATE TABLE IF NOT EXISTS institution_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  metric_period text NOT NULL,
  at_risk_count integer NOT NULL DEFAULT 0,
  avg_attendance integer NOT NULL DEFAULT 0,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS institution_metrics_tenant_period_uniq ON institution_metrics (tenant_id, metric_period);
CREATE INDEX IF NOT EXISTS institution_metrics_tenant_idx ON institution_metrics (tenant_id);

CREATE TABLE IF NOT EXISTS ai_generated_summaries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  domain text NOT NULL,
  target_student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  period text,
  dataset jsonb NOT NULL,
  output jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  created_by uuid,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  audit jsonb NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS ai_summaries_tenant_idx ON ai_generated_summaries (tenant_id);
CREATE INDEX IF NOT EXISTS ai_summaries_domain_idx ON ai_generated_summaries (domain);

CREATE TABLE IF NOT EXISTS prediction_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  domain text NOT NULL,
  target_student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  period text,
  model_name text NOT NULL DEFAULT 'future_model',
  input_dataset jsonb NOT NULL,
  prediction jsonb NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  error_message text
);

CREATE INDEX IF NOT EXISTS prediction_logs_tenant_idx ON prediction_logs (tenant_id);
CREATE INDEX IF NOT EXISTS prediction_logs_domain_idx ON prediction_logs (domain);
CREATE INDEX IF NOT EXISTS prediction_logs_student_idx ON prediction_logs (target_student_id);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify: SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;