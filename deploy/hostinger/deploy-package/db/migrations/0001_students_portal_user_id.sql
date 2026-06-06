-- Link portal login accounts to student records (run once against toppers_db)
ALTER TABLE students
  ADD COLUMN IF NOT EXISTS portal_user_id uuid REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS students_portal_user_id_unique_idx
  ON students (portal_user_id)
  WHERE portal_user_id IS NOT NULL;
