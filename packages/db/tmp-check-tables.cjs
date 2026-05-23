const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    const r = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name
    `);
    console.log('Tables in database:');
    r.rows.forEach(t => console.log(`  ${t.table_name}`));
  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await client.end();
  }
})();
