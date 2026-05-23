-- ============================================================================
-- TOOPERS COACHING - DATABASE SETUP SCRIPT
-- Run this on your Supabase PostgreSQL database via SQL Editor
-- ============================================================================
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Open SQL Editor (left sidebar)
-- 3. Paste the ENTIRE contents of this file
-- 4. Click "Run"
-- 5. Then run seeds below to populate initial data
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 0001: Portal user ID for students
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS portal_user_id uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS students_portal_user_id_unique_idx
  ON students (portal_user_id)
  WHERE portal_user_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 0002: Fee management fields
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS monthly_fee_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_cycle_start_date date,
  ADD COLUMN IF NOT EXISTS next_fee_due_date date;

CREATE INDEX IF NOT EXISTS students_next_fee_due_date_idx
  ON students (next_fee_due_date)
  WHERE next_fee_due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS students_fee_cycle_start_idx
  ON students (fee_cycle_start_date)
  WHERE fee_cycle_start_date IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- MIGRATION 0003: Attendance leave status + audit
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parent_contact varchar(32);

CREATE INDEX IF NOT EXISTS students_parent_contact_idx
  ON students (parent_contact)
  WHERE parent_contact IS NOT NULL;

ALTER TABLE attendance_summary
  ADD COLUMN IF NOT EXISTS leave_days integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS attendance_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendance(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  old_status varchar(32),
  new_status varchar(32) NOT NULL,
  changed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  changed_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS attendance_audit_student_idx
  ON attendance_audit (student_id);

CREATE INDEX IF NOT EXISTS attendance_audit_date_idx
  ON attendance_audit (changed_at);

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run these queries to verify everything is working:
-- SELECT 'students columns' AS check, column_name FROM information_schema.columns WHERE table_name='students';
-- SELECT 'attendance_summary columns' AS check, column_name FROM information_schema.columns WHERE table_name='attendance_summary';
-- SELECT 'tables created' AS check, tablename FROM pg_catalog.pg_tables WHERE tablename LIKE 'attendance_audit';