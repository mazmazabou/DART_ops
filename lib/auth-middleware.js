// lib/auth-middleware.js — Auth middleware, wrapAsync, rate limiters
'use strict';

const rateLimit = require('express-rate-limit');

// Async error wrapper — catches rejected promises and forwards to Express error handler
const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

function createAuthMiddleware(query) {
  async function requireAuth(req, res, next) {
    if (!req.session.userId) {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Not authenticated', code: 'SESSION_EXPIRED' });
      }
      return res.redirect('/login');
    }
    // Verify user still exists in DB (prevents ghost sessions after deletion)
    const userCheck = await query('SELECT id FROM users WHERE id = $1', [req.session.userId]);
    if (!userCheck.rowCount) {
      req.session.destroy(() => {});
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'User account no longer exists', code: 'SESSION_EXPIRED' });
      }
      return res.redirect('/login');
    }
    next();
  }

  function requireOffice(req, res, next) {
    if (!req.session.userId) {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Not authenticated', code: 'SESSION_EXPIRED' });
      }
      return res.redirect('/login');
    }
    if (req.session.role !== 'office') {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Office access required' });
      }
      return res.redirect('/login');
    }
    next();
  }

  function requireStaff(req, res, next) {
    if (!req.session.userId) {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Not authenticated', code: 'SESSION_EXPIRED' });
      }
      return res.redirect('/login');
    }
    if (req.session.role !== 'office' && req.session.role !== 'driver') {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Staff access required' });
      }
      return res.redirect('/login');
    }
    next();
  }

  function requireRider(req, res, next) {
    if (!req.session.userId) {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(401).json({ error: 'Not authenticated', code: 'SESSION_EXPIRED' });
      }
      return res.redirect('/login');
    }
    if (req.session.role !== 'rider') {
      if (req.path.startsWith('/api/') || req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(403).json({ error: 'Rider access required' });
      }
      return res.redirect('/login');
    }
    next();
  }

  function setSessionFromUser(req, user) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.name = user.name;
    req.session.role = user.role;
    req.session.email = user.email;
    req.session.memberId = user.member_id;
  }

  return {
    requireAuth,
    requireOffice,
    requireStaff,
    requireRider,
    setSessionFromUser
  };
}

function createRateLimiters(isProduction) {
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 10 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again later.' }
  });

  const signupLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isProduction ? 5 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many attempts. Please try again later.' }
  });

  return { loginLimiter, signupLimiter };
}

module.exports = { wrapAsync, createAuthMiddleware, createRateLimiters };
