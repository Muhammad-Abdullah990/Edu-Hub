import { Router } from "express";
import { pool } from "@toppers/db";

const router = Router();

router.get("/debug/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1 as val");
    return res.json({ ok: true, rows: result.rows });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

// Temporary: expose selected environment and actual DB session info for debugging
router.get("/debug/env", async (_req, res) => {
  try {
    const env = {
      DATABASE_URL: process.env.DATABASE_URL || null,
      PGHOST: process.env.PGHOST || null,
      PGUSER: process.env.PGUSER || null,
      PGPASSWORD: process.env.PGPASSWORD ? "<redacted>" : null,
      PGDATABASE: process.env.PGDATABASE || null,
      PGPORT: process.env.PGPORT || null,
    };

    // Query the database to show which DB/session the running process is actually connected to
    const result = await pool.query("SELECT current_database() as database, current_user as user, inet_server_port() as port");

    return res.json({ ok: true, env, dbSession: result.rows[0] });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
