const { Client } = require('pg');

(async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    // Step 1: Find all orphaned STUDENT users (users with role=STUDENT but no students row)
    const orphaned = await client.query(`
      SELECT u.id, u.name, u.email
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN students s ON s.portal_user_id = u.id
      WHERE r.name = 'STUDENT' AND s.id IS NULL
    `);
    console.log(`Found ${orphaned.rows.length} orphaned STUDENT users to backfill.`);

    if (orphaned.rows.length === 0) {
      console.log('Nothing to backfill. All STUDENT users have student records.');
      await client.end();
      return;
    }

    // Get existing max student code for auto-generation
    const maxCodeResult = await client.query(`
      SELECT student_code FROM students ORDER BY student_code DESC LIMIT 1
    `);
    let nextNum = 9; // 8 seed students exist (STU-001 to STU-008)
    if (maxCodeResult.rows.length > 0) {
      const maxCode = maxCodeResult.rows[0].student_code;
      const match = maxCode.match(/STU-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    console.log(`Starting student code generation from STU-${String(nextNum).padStart(3, '0')}`);

    let created = 0;
    for (const user of orphaned.rows) {
      const studentCode = `STU-${String(nextNum).padStart(3, '0')}`;
      nextNum++;

      // Insert student record linked to the user (match actual DB columns)
      await client.query(`
        INSERT INTO students (student_code, full_name, class, section, date_of_birth, admission_date, photo_url, status, portal_user_id, is_archived, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        ON CONFLICT DO NOTHING
      `, [
        studentCode,
        user.name,
        'General',
        'A',
        new Date().toISOString().split('T')[0],
        new Date().toISOString().split('T')[0],
        '',
        'active',
        user.id,
        false,
      ]);

      // Get the created student id
      const studentResult = await client.query(`
        SELECT id FROM students WHERE portal_user_id = $1
      `, [user.id]);

      if (studentResult.rows.length === 0) {
        console.log(`  FAILED to create student for: ${user.name} (${user.email})`);
        continue;
      }

      const studentId = studentResult.rows[0].id;

      // Create attendance summary
      await client.query(`
        INSERT INTO attendance_summary (student_id, attendance_percentage, total_days, present_days, absent_days, updated_at)
        VALUES ($1, 0, 0, 0, 0, NOW())
        ON CONFLICT (student_id) DO NOTHING
      `, [studentId]);

      // Create fee status
      await client.query(`
        INSERT INTO fee_status (student_id, status, outstanding_amount, updated_at)
        VALUES ($1, 'pending', 0, NOW())
        ON CONFLICT (student_id) DO NOTHING
      `, [studentId]);

      console.log(`  Created student: ${user.name} (email=${user.email}) code=${studentCode} id=${studentId}`);
      created++;
    }

    // Verify
    const userCount = await client.query(`
      SELECT count(*)::int as cnt FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'STUDENT'
    `);
    const studentCount = await client.query(`
      SELECT count(*)::int as cnt FROM students
    `);
    const orphanedAfter = await client.query(`
      SELECT count(*)::int as cnt FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN students s ON s.portal_user_id = u.id
      WHERE r.name = 'STUDENT' AND s.id IS NULL
    `);

    console.log(`\n=== BACKFILL SUMMARY ===`);
    console.log(`Created: ${created} student records`);
    console.log(`Total STUDENT users: ${userCount.rows[0].cnt}`);
    console.log(`Total students: ${studentCount.rows[0].cnt}`);
    console.log(`Remaining orphaned: ${orphanedAfter.rows[0].cnt}`);

    if (orphanedAfter.rows[0].cnt === 0) {
      console.log('\n✅ SUCCESS: All STUDENT users now have student records.');
    } else {
      console.log('\n❌ WARNING: Some STUDENT users still lack student records.');
    }

  } catch (error) {
    console.error('ERROR:', error);
  } finally {
    await client.end();
  }
})();