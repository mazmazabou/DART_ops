'use strict';

module.exports = function(app, ctx) {
  const {
    query,
    wrapAsync,
    requireOffice
  } = ctx;

  app.get('/api/program-rules', wrapAsync(async (req, res) => {
    try {
      const result = await query("SELECT rules_html FROM program_content WHERE id = 'default'");
      if (!result.rowCount) return res.json({ rulesHtml: '' });
      res.json({ rulesHtml: result.rows[0].rules_html });
    } catch (err) {
      console.error('GET /api/program-rules error:', err);
      res.status(500).json({ error: 'Failed to fetch rules' });
    }
  }));

  app.put('/api/program-rules', requireOffice, wrapAsync(async (req, res) => {
    const { rulesHtml } = req.body;
    if (typeof rulesHtml !== 'string') return res.status(400).json({ error: 'rulesHtml must be a string' });
    // Sanitize: strip script tags, on* event handlers, and javascript: URLs
    let sanitized = rulesHtml;
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    if (/<script/i.test(sanitized)) return res.status(400).json({ error: 'Script tags not allowed' });
    sanitized = sanitized.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');
    try {
      const existing = await query("SELECT id FROM program_content WHERE id = 'default'");
      if (existing.rowCount > 0) {
        await query("UPDATE program_content SET rules_html = $1, updated_at = NOW() WHERE id = 'default'", [sanitized]);
      } else {
        await query("INSERT INTO program_content (id, rules_html, updated_at) VALUES ('default', $1, NOW())", [sanitized]);
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('PUT /api/program-rules error:', err);
      res.status(500).json({ error: 'Failed to save rules' });
    }
  }));
};
