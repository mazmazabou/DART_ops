const nodemailer = require('nodemailer');

let transporter = null;
let emailEnabled = false;

function initEmail() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('[email] SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS). Emails will be logged to console.');
    return;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  emailEnabled = true;
  console.log(`[email] SMTP configured: ${host}:${port}`);
}

function isEmailEnabled() {
  return emailEnabled;
}

function getFrom() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || 'dart-noreply@usc.edu';
}

async function sendEmail(to, subject, html) {
  if (!emailEnabled || !transporter) {
    console.log(`[email] (not sent) To: ${to} | Subject: ${subject}`);
    return false;
  }
  try {
    await transporter.sendMail({
      from: getFrom(),
      to,
      subject,
      html
    });
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err.message);
    return false;
  }
}

async function sendWelcomeEmail(email, name, username, tempPassword) {
  const subject = 'Welcome to USC DART';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
      <div style="background:#990000;color:#FFCC00;padding:16px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">Welcome to USC DART</h2>
      </div>
      <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>Your USC DART account has been created.</p>
        <p><strong>Username:</strong> ${username}<br>
        <strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>You will be asked to change your password on your first login.</p>
        <p style="color:#666;font-size:13px;">Disabled Access To Road Transportation — USC Transportation</p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

async function sendPasswordResetEmail(email, name, tempPassword) {
  const subject = 'USC DART - Password Reset';
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
      <div style="background:#990000;color:#FFCC00;padding:16px 20px;border-radius:8px 8px 0 0;">
        <h2 style="margin:0;">Password Reset</h2>
      </div>
      <div style="padding:20px;border:1px solid #ddd;border-top:none;border-radius:0 0 8px 8px;">
        <p>Hi ${name},</p>
        <p>Your USC DART password has been reset by an administrator.</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>You will be asked to change your password on your next login.</p>
        <p style="color:#666;font-size:13px;">Disabled Access To Road Transportation — USC Transportation</p>
      </div>
    </div>
  `;
  return sendEmail(email, subject, html);
}

// Auto-initialize on require
initEmail();

module.exports = { isEmailEnabled, sendWelcomeEmail, sendPasswordResetEmail };
