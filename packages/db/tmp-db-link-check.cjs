const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const gaps = await client.query(
      "SELECT u.id AS user_id, u.name, u.email, u.status, r.name AS role_name FROM users u JOIN user_roles ur ON u.id=ur.user_id JOIN roles r ON ur.role_id=r.id WHERE r.name='STUDENT' AND NOT EXISTS (SELECT 1 FROM students s WHERE s.portal_user_id=u.id) ORDER BY u.created_at DESC"
    );
    console.log('student users without profile', gaps.rows);

    const unmatched = await client.query(
      "SELECT s.id AS student_id, s.student_code, s.full_name, s.portal_user_id FROM students s WHERE s.portal_user_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id=s.portal_user_id) ORDER BY s.created_at DESC"
    );
    console.log('students with missing user link', unmatched.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
})();
