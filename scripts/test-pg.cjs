const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const r = await pool.query('SELECT 1 as val');
    console.log('ROWS', r.rows);
  } catch (e) {
    console.error('ERR', e && e.message || e);
    process.exitCode = 2;
  } finally {
    await pool.end();
  }
})();
