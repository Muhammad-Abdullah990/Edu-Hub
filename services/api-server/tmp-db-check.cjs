const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const res1 = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
    console.log('tables', res1.rows.map(r => r.table_name).join(', '));
    const res2 = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='students' ORDER BY ordinal_position");
    console.log('students columns', res2.rows.map(r => r.column_name).join(', '));
    const res3 = await client.query("SELECT count(*) FROM students");
    console.log('students count', res3.rows[0].count);
    const res4 = await client.query("SELECT count(*) FROM users");
    console.log('users count', res4.rows[0].count);
    const res5 = await client.query("SELECT count(*) FROM users WHERE role='STUDENT'");
    console.log('student users count', res5.rows[0].count);
  } catch (error) {
    console.error(error);
  } finally {
    await client.end();
  }
})();
