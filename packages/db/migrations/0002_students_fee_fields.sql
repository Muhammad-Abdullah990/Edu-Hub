-- Add fee management fields to students table
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS monthly_fee_amount integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fee_cycle_start_date date,
  ADD COLUMN IF NOT EXISTS next_fee_due_date date;

-- Create index for fee due date lookups
CREATE INDEX IF NOT EXISTS students_next_fee_due_date_idx
  ON students (next_fee_due_date)
  WHERE next_fee_due_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS students_fee_cycle_start_idx
  ON students (fee_cycle_start_date)
  WHERE fee_cycle_start_date IS NOT NULL;
