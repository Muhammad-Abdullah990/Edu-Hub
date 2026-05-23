const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='users' ORDER BY ordinal_position");
    console.log('users columns', cols.rows.map(r => r.column_name).join(', '));
    const status = await client.query("SELECT status, is_archived, count(*) FROM students GROUP BY status, is_archived ORDER BY status, is_archived");
    console.log('students status counts', status.rows);
    const active = await client.query("SELECT count(*) FROM students WHERE status='active' AND is_archived=false");
    console.log('active students count', active.rows[0].count);
    const linked = await client.query("SELECT count(*) FROM students WHERE portal_user_id IS NOT NULL");
    console.log('students with portal_user_id', linked.rows[0].count);
    const roleStudents = await client.query("SELECT count(*) FROM users u JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id WHERE r.name='STUDENT'");
    console.log('users with STUDENT role', roleStudents.rows[0].count);
    const unmatched = await client.query("SELECT count(*) FROM students s LEFT JOIN users u ON s.portal_user_id=u.id WHERE s.portal_user_id IS NOT NULL AND u.id IS NULL");
    console.log('students with broken portal_user_id', unmatched.rows[0].count);
    const sample = await client.query("SELECT id, student_code, full_name, status, is_archived, portal_user_id FROM students ORDER BY created_at DESC LIMIT 10");
    console.log('sample students', sample.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
})();
