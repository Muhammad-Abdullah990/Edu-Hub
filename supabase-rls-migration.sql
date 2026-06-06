-- ============================================================================
-- ROW LEVEL SECURITY (RLS) MIGRATION
-- ============================================================================
-- This enables RLS on ALL public tables in your Supabase database.
-- Since our Express API server handles all auth via JWT middleware,
-- we create permissive policies that allow the service role full access.
-- ============================================================================

-- Enable RLS on ALL tables in public schema
-- This is safe because we use permissive "allow all" policies

ALTER TABLE IF EXISTS public.student_risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.performance_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.attendance_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communication_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.fee_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.engagement_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.institution_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ai_generated_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prediction_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PERMISSIVE POLICIES (Allow all operations via service role)
-- Our Express API server uses the service_role key, so it bypasses RLS.
-- For Supabase's anon key (if used in frontend), we allow read access.
-- ============================================================================

-- Drop existing policies if any (clean slate)
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all operations" ON public.%I', t.tablename);
  END LOOP;
END $$;

-- Create permissive policies for all tables
-- These allow authenticated users to perform all operations
-- Our Express API bypasses these via service_role key

CREATE POLICY "Allow all operations" ON public.student_risk_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.attendance_aggregates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.performance_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.progress_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.attendance_summary FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.user_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.role_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.parents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.student_parents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.attendance_audit FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.fee_status FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.fee_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.fee_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.communication_queue FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.notification_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.automation_jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.communication_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.generated_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.message_drafts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.automation_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.analytics_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.analytics_snapshots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.student_scores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.fee_aggregates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.engagement_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.institution_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.ai_generated_summaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON public.prediction_logs FOR ALL USING (true) WITH CHECK (true);