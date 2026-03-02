'use strict';

module.exports = function(app, ctx) {
  const {
    query,
    wrapAsync,
    requireStaff,
    requireOffice,
    generateId
  } = ctx;

  // ----- Vehicle endpoints -----
  app.get('/api/vehicles', requireStaff, wrapAsync(async (req, res) => {
    const includeRetired = req.query.includeRetired === 'true';
    const sql = includeRetired
      ? `SELECT * FROM vehicles ORDER BY name`
      : `SELECT * FROM vehicles WHERE status != 'retired' ORDER BY name`;
    const result = await query(sql);
    res.json(result.rows);
  }));

  app.post('/api/vehicles', requireOffice, wrapAsync(async (req, res) => {
    const { name, type, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Vehicle name is required' });
    const dup = await query('SELECT id FROM vehicles WHERE LOWER(name) = LOWER($1)', [name]);
    if (dup.rowCount) return res.status(409).json({ error: 'A vehicle with this name already exists' });
    const id = generateId('veh');
    await query(
      `INSERT INTO vehicles (id, name, type, notes) VALUES ($1, $2, $3, $4)`,
      [id, name, type || 'standard', notes || '']
    );
    const result = await query(`SELECT * FROM vehicles WHERE id = $1`, [id]);
    res.json(result.rows[0]);
  }));

  app.put('/api/vehicles/:id', requireOffice, wrapAsync(async (req, res) => {
    const { name, type, status, notes, totalMiles } = req.body;
    if (name) {
      const dup = await query('SELECT id FROM vehicles WHERE LOWER(name) = LOWER($1) AND id != $2', [name, req.params.id]);
      if (dup.rowCount) return res.status(409).json({ error: 'A vehicle with this name already exists' });
    }
    const result = await query(
      `UPDATE vehicles SET
         name = COALESCE($1, name),
         type = COALESCE($2, type),
         status = COALESCE($3, status),
         notes = COALESCE($4, notes),
         total_miles = COALESCE($5, total_miles)
       WHERE id = $6
       RETURNING *`,
      [name || null, type || null, status || null, notes || null, totalMiles != null ? totalMiles : null, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(result.rows[0]);
  }));

  app.delete('/api/vehicles/:id', requireOffice, wrapAsync(async (req, res) => {
    await query(`UPDATE rides SET vehicle_id = NULL WHERE vehicle_id = $1`, [req.params.id]);
    const result = await query(`DELETE FROM vehicles WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ success: true });
  }));

  app.post('/api/vehicles/:id/retire', requireOffice, wrapAsync(async (req, res) => {
    const check = await query(`SELECT status FROM vehicles WHERE id = $1`, [req.params.id]);
    if (!check.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    if (check.rows[0].status === 'retired') return res.status(400).json({ error: 'Vehicle is already retired' });
    const result = await query(`UPDATE vehicles SET status = 'retired' WHERE id = $1 RETURNING *`, [req.params.id]);
    res.json(result.rows[0]);
  }));

  app.post('/api/vehicles/:id/maintenance', requireOffice, wrapAsync(async (req, res) => {
    const { notes, mileage } = req.body;
    const result = await query(
      `UPDATE vehicles SET
         last_maintenance_date = CURRENT_DATE,
         notes = COALESCE($1, notes),
         total_miles = COALESCE($2, total_miles)
       WHERE id = $3
       RETURNING *`,
      [notes || null, mileage != null ? mileage : null, req.params.id]
    );
    if (!result.rowCount) return res.status(404).json({ error: 'Vehicle not found' });
    const logId = generateId('mlog');
    await query(
      `INSERT INTO maintenance_logs (id, vehicle_id, service_date, notes, mileage_at_service, performed_by)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, $5)`,
      [logId, req.params.id, notes || null, mileage != null ? mileage : null, req.session.userId]
    );
    res.json(result.rows[0]);
  }));

  app.get('/api/vehicles/:id/maintenance', requireStaff, wrapAsync(async (req, res) => {
    const result = await query(
      `SELECT ml.*, u.name AS performed_by_name
       FROM maintenance_logs ml
       LEFT JOIN users u ON u.id = ml.performed_by
       WHERE ml.vehicle_id = $1
       ORDER BY ml.service_date DESC, ml.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  }));
};
