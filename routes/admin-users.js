'use strict';

module.exports = function(app, ctx) {
  const {
    query,
    pool,
    wrapAsync,
    requireOffice,
    bcrypt,
    generateId,
    isValidEmail,
    isValidMemberId,
    isValidPhone,
    mapRide,
    addRideEvent,
    getSetting,
    getRiderMissCount,
    setRiderMissCount,
    TENANT,
    DEMO_MODE,
    MIN_PASSWORD_LENGTH,
    emailConfigured,
    sendWelcomeEmail,
    sendPasswordResetEmail
  } = ctx;

  // ----- Admin endpoints -----
  app.get('/api/admin/users', requireOffice, wrapAsync(async (req, res) => {
    const includeDeleted = req.query.include_deleted === 'true';
    const result = includeDeleted
      ? await query(`SELECT id, username, name, email, member_id, phone, role, active, deleted_at FROM users ORDER BY role, name`)
      : await query(`SELECT id, username, name, email, member_id, phone, role, active FROM users WHERE deleted_at IS NULL ORDER BY role, name`);
    res.json(result.rows);
  }));

  app.get('/api/admin/users/search', requireOffice, wrapAsync(async (req, res) => {
    const member_id = req.query.member_id || req.query.usc_id;
    if (!member_id || !isValidMemberId(member_id)) return res.status(400).json({ error: `Invalid ${TENANT.idFieldLabel}` });
    const result = await query(
      `SELECT id, username, name, email, member_id, phone, role, active FROM users WHERE member_id = $1 AND deleted_at IS NULL`,
      [member_id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'No user found' });
    res.json(result.rows[0]);
  }));

  app.delete('/api/admin/users/:id', requireOffice, wrapAsync(async (req, res) => {
    const targetId = req.params.id;
    if (targetId === req.session.userId) return res.status(400).json({ error: 'Cannot delete your own office account' });

    const userRes = await query(`SELECT id, role FROM users WHERE id = $1 AND deleted_at IS NULL`, [targetId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Soft-delete the user
      await client.query(
        `UPDATE users SET deleted_at = NOW(), active = FALSE, updated_at = NOW() WHERE id = $1`,
        [targetId]
      );

      if (user.role === 'driver') {
        // Unassign active rides and revert to approved
        const activeRides = await client.query(
          `SELECT id FROM rides WHERE assigned_driver_id = $1 AND status IN ('scheduled', 'driver_on_the_way', 'driver_arrived_grace')`,
          [targetId]
        );
        for (const ride of activeRides.rows) {
          await client.query(
            `UPDATE rides SET assigned_driver_id = NULL, vehicle_id = NULL, status = 'approved', grace_start_time = NULL, updated_at = NOW() WHERE id = $1`,
            [ride.id]
          );
          await addRideEvent(ride.id, req.session.userId, 'unassigned', 'Driver account deactivated', null, client);
        }
      } else if (user.role === 'rider') {
        // Cancel pending/approved rides
        const openRides = await client.query(
          `SELECT id FROM rides WHERE rider_id = $1 AND status IN ('pending', 'approved')`,
          [targetId]
        );
        for (const ride of openRides.rows) {
          await client.query(
            `UPDATE rides SET status = 'cancelled', cancelled_by = 'office', updated_at = NOW() WHERE id = $1`,
            [ride.id]
          );
          await addRideEvent(ride.id, req.session.userId, 'cancelled_by_office', 'Rider account deactivated', null, client);
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.json({ success: true, deletedId: targetId });
  }));

  // Restore a soft-deleted user
  app.post('/api/admin/users/:id/restore', requireOffice, wrapAsync(async (req, res) => {
    const targetId = req.params.id;
    const userRes = await query(`SELECT id, username, email FROM users WHERE id = $1 AND deleted_at IS NOT NULL`, [targetId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found or not deleted' });

    // Check uniqueness conflicts with active users
    const conflict = await query(
      `SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3 AND deleted_at IS NULL`,
      [user.username, user.email, targetId]
    );
    if (conflict.rowCount) {
      return res.status(409).json({ error: 'Cannot restore: username or email conflicts with an active user' });
    }

    await query(`UPDATE users SET deleted_at = NULL, updated_at = NOW() WHERE id = $1`, [targetId]);
    res.json({ success: true, restoredId: targetId });
  }));

  app.post('/api/admin/users', requireOffice, wrapAsync(async (req, res) => {
    const { name, email, phone, memberId, role, password, username: reqUsername } = req.body;
    if (!name || !email || !memberId || !role || !password) {
      return res.status(400).json({ error: `Name, email, ${TENANT.idFieldLabel}, role, and password are required` });
    }
    if (!isValidEmail(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (!isValidMemberId(memberId)) return res.status(400).json({ error: `Invalid ${TENANT.idFieldLabel}` });
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone format' });
    if (!['rider', 'driver', 'office'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
    if (password.length < MIN_PASSWORD_LENGTH) return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });

    const username = reqUsername ? reqUsername.trim().toLowerCase() : email.toLowerCase().split('@')[0];
    if (!/^[a-z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
    }
    const existing = await query('SELECT 1 FROM users WHERE (username = $1 OR email = $2 OR member_id = $3 OR phone = $4) AND deleted_at IS NULL', [username, email.toLowerCase(), memberId, phone || null]);
    if (existing.rowCount) {
      return res.status(400).json({ error: `Username, email, phone, or ${TENANT.idFieldLabel} already exists` });
    }

    const id = generateId(role);
    const hash = await bcrypt.hash(password, 10);
    await query(
      `INSERT INTO users (id, username, password_hash, name, email, member_id, phone, role, active, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE, TRUE)`,
      [id, username, hash, name, email.toLowerCase(), memberId, phone || null, role]
    );

    // Fire-and-forget welcome email
    let emailSent = false;
    try {
      emailSent = emailConfigured();
      if (emailSent) sendWelcomeEmail(email.toLowerCase(), name, username, password, role, TENANT.orgName, { primary: TENANT.primaryColor, secondary: TENANT.secondaryColor }).catch(() => {});
    } catch {}

    const result = await query(
      `SELECT id, username, name, email, member_id, phone, role, active FROM users WHERE id = $1`,
      [id]
    );
    res.json({ ...result.rows[0], emailSent });
  }));

  app.put('/api/admin/users/:id', requireOffice, wrapAsync(async (req, res) => {
    const targetId = req.params.id;
    if (targetId === req.session.userId) return res.status(400).json({ error: 'Cannot edit your own office account here' });
    const { name, phone, email, memberId, role } = req.body;
    if (name && name.length > 120) return res.status(400).json({ error: 'Name too long' });
    if (!isValidPhone(phone)) return res.status(400).json({ error: 'Invalid phone format' });
    if (email && !isValidEmail(email)) return res.status(400).json({ error: 'A valid email is required' });
    if (memberId && !isValidMemberId(memberId)) return res.status(400).json({ error: `Invalid ${TENANT.idFieldLabel}` });
    if (role && !['rider', 'driver', 'office'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    // Uniqueness checks for email and member_id
    if (email) {
      const dup = await query('SELECT id FROM users WHERE email = $1 AND id != $2 AND deleted_at IS NULL', [email.toLowerCase(), targetId]);
      if (dup.rowCount) return res.status(400).json({ error: 'Email already in use by another user' });
    }
    if (memberId) {
      const dup = await query('SELECT id FROM users WHERE member_id = $1 AND id != $2 AND deleted_at IS NULL', [memberId, targetId]);
      if (dup.rowCount) return res.status(400).json({ error: `${TENANT.idFieldLabel} already in use by another user` });
    }

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), phone = COALESCE($2, phone),
       email = COALESCE($3, email), member_id = COALESCE($4, member_id), role = COALESCE($5, role),
       updated_at = NOW()
       WHERE id = $6
       RETURNING id, username, name, email, member_id, phone, role, active`,
      [name || null, phone || null, email ? email.toLowerCase() : null, memberId || null, role || null, targetId]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }));

  app.get('/api/admin/users/:id/profile', requireOffice, wrapAsync(async (req, res) => {
    const key = req.params.id;
    const userRes = await query(
      `SELECT id, username, name, email, member_id, phone, role, active, deleted_at FROM users WHERE id = $1 OR email = $1 OR username = $1`,
      [key]
    );
    if (!userRes.rowCount) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    let upcoming = [];
    let past = [];
    if (user.role === 'rider') {
      const ridesRes = await query(
        `SELECT id, rider_name, rider_email, rider_phone, pickup_location, dropoff_location, notes,
                requested_time, status, assigned_driver_id, grace_start_time, consecutive_misses, recurring_id, rider_id, vehicle_id
         FROM rides
         WHERE rider_id = $1 OR rider_email = $2
         ORDER BY requested_time DESC`,
        [user.id, user.email]
      );
      const mapped = ridesRes.rows.map(mapRide);
      upcoming = mapped.filter((r) => ['pending','approved','scheduled','driver_on_the_way','driver_arrived_grace'].includes(r.status));
      past = mapped.filter((r) => ['completed','no_show','denied','cancelled'].includes(r.status));
    } else if (user.role === 'driver') {
      const ridesRes = await query(
        `SELECT id, rider_name, rider_email, rider_phone, pickup_location, dropoff_location, notes,
                requested_time, status, assigned_driver_id, grace_start_time, consecutive_misses, recurring_id, rider_id, vehicle_id
         FROM rides
         WHERE assigned_driver_id = $1
         ORDER BY requested_time DESC`,
        [user.id]
      );
      const mapped = ridesRes.rows.map(mapRide);
      upcoming = mapped.filter((r) => ['pending','approved','scheduled','driver_on_the_way','driver_arrived_grace'].includes(r.status));
      past = mapped.filter((r) => ['completed','no_show','denied','cancelled'].includes(r.status));
    }

    let missCount = 0;
    let maxStrikes = parseInt(await getSetting('max_no_show_strikes')) || 5;
    if (user.role === 'rider') {
      missCount = await getRiderMissCount(user.id);
    }

    res.json({ user, upcoming, past, missCount, maxStrikes });
  }));

  // Admin reset rider miss count
  app.post('/api/admin/users/:id/reset-miss-count', requireOffice, wrapAsync(async (req, res) => {
    const userRes = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.params.id]);
    if (!userRes.rowCount) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];
    if (user.role !== 'rider') return res.status(400).json({ error: 'Only rider accounts have a miss count' });
    await setRiderMissCount(user.id, 0);
    res.json({ success: true, missCount: 0 });
  }));

  // Admin reset password for another user
  app.post('/api/admin/users/:id/reset-password', requireOffice, wrapAsync(async (req, res) => {
    if (DEMO_MODE) return res.status(403).json({ error: 'Password resets are disabled in demo mode' });
    const targetId = req.params.id;
    if (targetId === req.session.userId) {
      return res.status(400).json({ error: 'Use the change password feature for your own account' });
    }
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }
    const userRes = await query('SELECT id, name, email FROM users WHERE id = $1', [targetId]);
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    const hash = await bcrypt.hash(newPassword, 10);
    await query(
      `UPDATE users SET password_hash = $1, must_change_password = TRUE, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2`,
      [hash, targetId]
    );

    // Attempt email notification
    let emailSent = false;
    try {
      emailSent = emailConfigured();
      if (emailSent && user.email) sendPasswordResetEmail(user.email, user.name, newPassword, TENANT.orgName, { primary: TENANT.primaryColor, secondary: TENANT.secondaryColor }).catch(() => {});
    } catch {}

    res.json({ success: true, emailSent });
  }));

  // Email status check
  app.get('/api/admin/email-status', requireOffice, (req, res) => {
    let configured = false;
    try {
      configured = emailConfigured();
    } catch {}
    res.json({ configured });
  });
};
