const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r1 = await client.query('SELECT id, name FROM roles');
    console.log('=== ROLES ===');
    r1.rows.forEach(r => console.log(`  id=${r.id} name=${r.name}`));

    const r2 = await client.query('SELECT count(*)::int as cnt FROM users');
    console.log(`\nTotal users: ${r2.rows[0].cnt}`);

    const r3 = await client.query(`SELECT u.id, u.name, u.email, r.name as role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'STUDENT'`);
    console.log(`\n=== STUDENT users (${r3.rows.length}) ===`);
    r3.rows.forEach(r => console.log(`  id=${r.id} name=${r.name} email=${r.email}`));

    const r4 = await client.query('SELECT count(*)::int as cnt FROM students');
    console.log(`\nTotal students: ${r4.rows[0].cnt}`);

    const r5 = await client.query('SELECT id, student_code, full_name, portal_user_id FROM students');
    console.log(`\n=== Students (${r5.rows.length}) ===`);
    r5.rows.forEach(r => console.log(`  id=${r.id} code=${r.student_code} name=${r.full_name} portalUserId=${r.portal_user_id}`));

    // Check for orphaned STUDENT users (users with role=STUDENT but no matching students row)
    const r6 = await client.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN students s ON s.portal_user_id = u.id
      WHERE r.name = 'STUDENT' AND s.id IS NULL
    `);
    console.log(`\n=== STUDENT users WITHOUT students row (${r6.rows.length}) ===`);
    r6.rows.forEach(r => console.log(`  ORPHANED: id=${r.id} name=${r.name} email=${r.email}`));
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await client.end();
  }
})();