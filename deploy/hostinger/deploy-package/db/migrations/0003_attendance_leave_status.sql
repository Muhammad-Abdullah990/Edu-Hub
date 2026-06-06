-- Add support for "leave" attendance status
-- The attendance table already accepts varchar status, so no schema change needed
-- But we need to add parent_contact to students for fee reminders

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS parent_contact varchar(32);

-- Create index for parent contact lookups
CREATE INDEX IF NOT EXISTS students_parent_contact_idx
  ON students (parent_contact)
  WHERE parent_contact IS NOT NULL;

-- Update attendance_summary to track leave days separately
ALTER TABLE attendance_summary
  ADD COLUMN IF NOT EXISTS leave_days integer NOT NULL DEFAULT 0;

-- Create an audit trail for attendance changes
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