const { pool } = require('@toppers/db');
(async () => {
  try {
    const r = await pool.query('SELECT 1 as val');
    console.log('ROWS', r.rows);
  } catch (e) {
    console.error('ERR', e);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch {}
    process.exit(0);
  }
})();
