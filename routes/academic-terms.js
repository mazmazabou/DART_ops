'use strict';

module.exports = function(app, ctx) {
  const {
    query,
    wrapAsync,
    requireStaff,
    requireOffice,
    generateId
  } = ctx;

  // ----- Academic Terms -----

  function validateTermInput(body) {
    const errors = [];
    const trimmedName = (body.name || '').trim();
    if (!trimmedName || trimmedName.length > 50) errors.push('Term name is required (max 50 characters)');
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!body.start_date || !dateRe.test(body.start_date)) errors.push('Valid start date is required (YYYY-MM-DD)');
    if (!body.end_date || !dateRe.test(body.end_date)) errors.push('Valid end date is required (YYYY-MM-DD)');
    if (body.start_date && body.end_date && body.end_date <= body.start_date) errors.push('End date must be after start date');
    return { trimmedName, errors };
  }

  app.get('/api/academic-terms', requireStaff, wrapAsync(async (req, res) => {
    try {
      const result = await query(
        'SELECT id, name, start_date::text, end_date::text, sort_order FROM academic_terms ORDER BY sort_order ASC, start_date DESC'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('academic-terms list error:', err);
      res.status(500).json({ error: 'Failed to fetch academic terms' });
    }
  }));

  app.post('/api/academic-terms', requireOffice, wrapAsync(async (req, res) => {
    try {
      const { trimmedName, errors } = validateTermInput(req.body);
      if (errors.length) return res.status(400).json({ error: errors[0] });

      const { start_date, end_date, sort_order } = req.body;
      const id = generateId('term');
      const sortVal = Number.isInteger(sort_order) && sort_order >= 0 ? sort_order : 0;

      const result = await query(
        `INSERT INTO academic_terms (id, name, start_date, end_date, sort_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, start_date::text, end_date::text, sort_order`,
        [id, trimmedName, start_date, end_date, sortVal]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error('academic-terms create error:', err);
      res.status(500).json({ error: 'Failed to create academic term' });
    }
  }));

  app.put('/api/academic-terms/:id', requireOffice, wrapAsync(async (req, res) => {
    try {
      const existing = await query('SELECT id FROM academic_terms WHERE id = $1', [req.params.id]);
      if (!existing.rowCount) return res.status(404).json({ error: 'Academic term not found' });

      const { trimmedName, errors } = validateTermInput(req.body);
      if (errors.length) return res.status(400).json({ error: errors[0] });

      const { start_date, end_date, sort_order } = req.body;
      const sortVal = Number.isInteger(sort_order) && sort_order >= 0 ? sort_order : 0;

      const result = await query(
        `UPDATE academic_terms
         SET name = $1, start_date = $2, end_date = $3, sort_order = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING id, name, start_date::text, end_date::text, sort_order`,
        [trimmedName, start_date, end_date, sortVal, req.params.id]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error('academic-terms update error:', err);
      res.status(500).json({ error: 'Failed to update academic term' });
    }
  }));

  app.delete('/api/academic-terms/:id', requireOffice, wrapAsync(async (req, res) => {
    try {
      const result = await query('DELETE FROM academic_terms WHERE id = $1 RETURNING id', [req.params.id]);
      if (!result.rowCount) return res.status(404).json({ error: 'Academic term not found' });
      res.json({ success: true });
    } catch (err) {
      console.error('academic-terms delete error:', err);
      res.status(500).json({ error: 'Failed to delete academic term' });
    }
  }));
};
