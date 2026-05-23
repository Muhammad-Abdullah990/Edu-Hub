const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('=== FULL SYSTEM VERIFICATION ===\n');

    // 1. USERS
    const users = await client.query('SELECT count(*)::int as cnt FROM users');
    const studentUsers = await client.query("SELECT count(*)::int as cnt FROM users u JOIN roles r ON r.id=u.role_id WHERE r.name='STUDENT'");
    console.log(`[USERS] Total: ${users.rows[0].cnt}, STUDENT role: ${studentUsers.rows[0].cnt}`);

    // 2. STUDENTS
    const students = await client.query('SELECT count(*)::int as cnt FROM students');
    const linkedStudents = await client.query('SELECT count(*)::int as cnt FROM students WHERE portal_user_id IS NOT NULL');
    const orphaned = await client.query("SELECT count(*)::int as cnt FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN students s ON s.portal_user_id=u.id WHERE r.name='STUDENT' AND s.id IS NULL");
    console.log(`[STUDENTS] Total: ${students.rows[0].cnt}, Linked to portal: ${linkedStudents.rows[0].cnt}, Orphaned students: ${orphaned.rows[0].cnt}`);
    if (orphaned.rows[0].cnt === 0) console.log('  ✅ USERS-STUDENTS sync: PASS');
    else console.log('  ❌ USERS-STUDENTS sync: FAIL');

    // 3. ATTENDANCE SUMMARY
    const attSum = await client.query('SELECT count(*)::int as cnt FROM attendance_summary');
    console.log(`[ATTENDANCE SUMMARY] Total: ${attSum.rows[0].cnt}`);
    if (attSum.rows[0].cnt === students.rows[0].cnt) console.log('  ✅ ATTENDANCE sync: PASS');

    // 4. FEE STATUS
    const feeStat = await client.query('SELECT count(*)::int as cnt FROM fee_status');
    console.log(`[FEE STATUS] Total: ${feeStat.rows[0].cnt}`);
    if (feeStat.rows[0].cnt === students.rows[0].cnt) console.log('  ✅ FEES sync: PASS');

    // 5. PROGRESS REPORTS
    const progressReports = await client.query('SELECT count(*)::int as cnt FROM progress_reports');
    console.log(`[PROGRESS REPORTS] Total: ${progressReports.rows[0].cnt}`);

    // 6. PARENTS & STUDENT_PARENTS
    const parents = await client.query('SELECT count(*)::int as cnt FROM parents');
    const sp = await client.query('SELECT count(*)::int as cnt FROM student_parents');
    console.log(`[PARENTS] Total: ${parents.rows[0].cnt}, Links: ${sp.rows[0].cnt}`);

    // 7. COMMUNICATIONS
    const comms = await client.query('SELECT count(*)::int as cnt FROM communication_queue');
    console.log(`[COMMUNICATIONS] Queue: ${comms.rows[0].cnt}`);

    // 8. AUDIT LOGS
    const audit = await client.query('SELECT count(*)::int as cnt FROM audit_logs');
    console.log(`[AUDIT LOGS] Total: ${audit.rows[0].cnt}`);

    // 9. Attendances recorded
    const attRecords = await client.query('SELECT count(*)::int as cnt FROM attendance');
    console.log(`[ATTENDANCE RECORDS] Total: ${attRecords.rows[0].cnt}`);

    console.log('\n=== REGRESSION CHECK ===');
    // Verify no orphans at the end
    const finalOrphans = await client.query("SELECT count(*)::int as cnt FROM users u JOIN roles r ON r.id=u.role_id LEFT JOIN students s ON s.portal_user_id=u.id WHERE r.name='STUDENT' AND s.id IS NULL");
    console.log(`Final orphan check: ${finalOrphans.rows[0].cnt}`);
    if (finalOrphans.rows[0].cnt === 0) console.log('✅ ALL STUDENT USERS HAVE STUDENT PROFILES');

    // Show the linked students
    const linked = await client.query('SELECT s.full_name, s.student_code, u.name as user_name FROM students s JOIN users u ON u.id = s.portal_user_id WHERE s.portal_user_id IS NOT NULL ORDER BY s.full_name');
    console.log(`\nLinked students (${linked.rows.length}):`);
    linked.rows.forEach(r => console.log(`  ${r.full_name} (${r.student_code}) -> User: ${r.user_name}`));

    await client.end();
  } catch (error) {
    console.error('ERROR:', error);
  }
})();