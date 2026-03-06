'use strict';
// Targeted retake for issues found by ui-polish agent:
//   1. DB cleanup — E2E ghost users in milestones, "E2E test ride" notes in rider views
//   2. driver-home — use waitForSelector('button:has-text("CLOCK OUT")') to confirm online state
//   3. rider-driver-otw — advance Casey ride to OTW via office API, wait for .pulse-dot.on-the-way
//   4. analytics-attendance — use this-month filter (today has no clock-event data)

const { chromium } = require('playwright');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'screenshots');
const MOBILE = { width: 390, height: 844 };
const DESKTOP = { width: 1920, height: 1080 };
const CAMPUSES = ['usc', 'ucla', 'stanford', 'uci'];

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function loginCampus(browser, campus, username, viewport) {
  const ctx = await browser.newContext({ viewport });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/${campus}/login`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#username', { timeout: 8000 });
  await page.fill('#username', username);
  await page.fill('#password', 'demo123');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  await page.waitForLoadState('networkidle').catch(() => {});
  await delay(800);
  return { ctx, page };
}

// ── Step 1: DB cleanup ─────────────────────────────────────────────────────

async function cleanupE2EArtifacts() {
  console.log('\n[Step 1] Cleaning E2E test artifacts from DB...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost/rideops',
  });
  try {
    // Core demo user IDs to never delete
    const coreIds = ['office', 'emp1', 'emp2', 'emp3', 'emp4', 'rider1', 'rider2'];

    // Find users with "E2E" in their name (created by E2E test suite)
    const e2eUsers = await pool.query(
      `SELECT id, username, name FROM users
       WHERE (name ILIKE '%E2E%' OR name ILIKE '%e2e%' OR username ILIKE 'e2e_%' OR username ILIKE 'playwright_%')
         AND id <> ALL($1::text[])
         AND deleted_at IS NULL`,
      [coreIds]
    );

    if (e2eUsers.rows.length > 0) {
      const ids = e2eUsers.rows.map(r => r.id);
      console.log(`  Found ${ids.length} E2E user(s):`, e2eUsers.rows.map(r => r.name || r.username).join(', '));
      // Soft-delete them
      await pool.query(`UPDATE users SET deleted_at = NOW() WHERE id = ANY($1::text[])`, [ids]);
      console.log(`  Soft-deleted ${ids.length} E2E user(s).`);
    } else {
      console.log('  No E2E users found.');
    }

    // Clean up ride notes that contain test data text
    const noteUpdate = await pool.query(
      `UPDATE rides SET notes = NULL
       WHERE (notes ILIKE '%e2e%' OR notes ILIKE '%test ride%' OR notes = 'test')`
    );
    if (noteUpdate.rowCount > 0) {
      console.log(`  Cleared test notes from ${noteUpdate.rowCount} ride(s).`);
    } else {
      console.log('  No rides with test notes found.');
    }

    // Cancel ALL of Casey's active rides so the fresh OTW ride is the only one shown
    // (activeRides sorted ASC by requestedTime — oldest shows as hero; old demo rides would steal focus)
    const cancelCasey = await pool.query(
      `UPDATE rides SET status = 'cancelled'
       WHERE rider_email = 'hello+casey@ride-ops.com'
         AND status IN ('pending', 'approved', 'scheduled', 'driver_on_the_way', 'driver_arrived_grace')`
    );
    console.log(`  Cancelled ${cancelCasey.rowCount} of Casey's active ride(s) to clear the slate.`);
  } catch (err) {
    console.warn('  Warning during cleanup:', err.message);
  } finally {
    await pool.end();
  }
}

// ── Step 2: Driver Home retakes ────────────────────────────────────────────

async function retakeDriverHome(browser) {
  console.log('\n[Step 2] Retaking driver-home screenshots...');
  let captured = 0;

  for (const campus of CAMPUSES) {
    const name = `${campus}-driver-home.png`;
    console.log(`  ${campus}...`);

    // Pre-clock in Alex via office session to ensure DB is updated
    try {
      const { ctx: offCtx, page: offPage } = await loginCampus(browser, campus, 'office', DESKTOP);
      await offPage.request.post(`${BASE}/api/employees/clock-in`, { data: { employeeId: 'emp1' } });
      await offCtx.close();
    } catch (e) {
      console.log(`  [warn] office clock-in failed for ${campus}: ${e.message}`);
    }

    const { ctx, page } = await loginCampus(browser, campus, 'alex', MOBILE);
    try {
      // Clock in within Alex's session too (belt and suspenders)
      await page.request.post(`${BASE}/api/employees/clock-in`, { data: { employeeId: 'emp1' } }).catch(() => {});

      // Navigate to home panel
      await page.click('button[data-target="home-panel"]').catch(() => {});

      // Wait for the "CLOCK OUT" button — only visible when driver is online (isActive=true)
      // Driver polls every 3s; allow up to 12s (4 poll cycles) to be safe
      await page.waitForSelector('button:has-text("CLOCK OUT")', { timeout: 12000 });
      await delay(300); // Let render settle
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(OUT, name), fullPage: false });
      console.log(`  [captured] ${name}`);
      captured++;
    } catch (err) {
      console.log(`  [error] ${name}: ${err.message}`);
    } finally {
      await ctx.close();
    }
  }

  console.log(`  Driver-home captured: ${captured}/${CAMPUSES.length}`);
}

// ── Step 3: Rider OTW retakes ──────────────────────────────────────────────

async function retakeRiderOTW(browser) {
  console.log('\n[Step 3] Retaking rider-driver-otw screenshots...');
  let captured = 0;

  for (const campus of CAMPUSES) {
    const name = `${campus}-rider-driver-otw.png`;
    console.log(`  ${campus}...`);

    let advancedRideId = null;

    // Use office session to create a fresh Casey ride and advance to OTW
    // (All Casey's previous active rides were cancelled in DB cleanup)
    const { ctx: offCtx, page: offPage } = await loginCampus(browser, campus, 'office', DESKTOP);
    try {
      const createRes = await offPage.request.post(`${BASE}/api/rides`, {
        data: {
          riderName: 'Casey Rivera',
          riderEmail: 'hello+casey@ride-ops.com',
          riderPhone: '(213) 555-0101',
          pickupLocation: 'Main Library',
          dropoffLocation: 'Student Center',
          requestedTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        },
      });
      if (createRes.ok()) {
        const created = await createRes.json();
        advancedRideId = created.id;
        await offPage.request.post(`${BASE}/api/rides/${advancedRideId}/approve`);
        await offPage.request.post(`${BASE}/api/rides/${advancedRideId}/claim`, {
          data: { driverId: 'emp1' },
        });
        await delay(200);
        const otwRes = await offPage.request.post(`${BASE}/api/rides/${advancedRideId}/on-the-way`, {
          data: { vehicleId: 'veh_cart2' },
        });
        const otwBody = await otwRes.json().catch(() => ({}));
        console.log(`  Created+OTW: ${otwRes.status()} → ${otwBody.status || otwBody.error || '?'}`);
      } else {
        console.log(`  [warn] ride creation failed: ${createRes.status()}`);
      }
    } catch (e) {
      console.log(`  [office error] ${e.message}`);
    } finally {
      await offCtx.close();
    }

    // Login as Casey and wait for the actual OTW DOM indicator
    const { ctx: riderCtx, page: riderPage } = await loginCampus(browser, campus, 'casey', MOBILE);
    try {
      // Go to My Rides tab
      await riderPage.click('button[data-target="myrides-panel"]');
      await delay(800);

      // Wait for .pulse-dot.on-the-way — only renders when status === 'driver_on_the_way'
      // Rider polls every 5s; allow up to 15s (3 poll cycles)
      await riderPage.waitForSelector('.pulse-dot.on-the-way', { timeout: 15000 });
      await delay(300);
      await riderPage.evaluate(() => window.scrollTo(0, 0));
      await riderPage.screenshot({ path: path.join(OUT, name), fullPage: false });
      console.log(`  [captured] ${name} (OTW confirmed)`);
      captured++;
    } catch (err) {
      console.log(`  [error] ${name}: ${err.message}`);
      // Fallback: capture whatever is showing
      try {
        await riderPage.evaluate(() => window.scrollTo(0, 0));
        await riderPage.screenshot({ path: path.join(OUT, name), fullPage: false });
        console.log(`  [captured fallback] ${name}`);
        captured++;
      } catch {}
    } finally {
      await riderCtx.close();
    }
  }

  console.log(`  Rider OTW captured: ${captured}/${CAMPUSES.length}`);
}

// ── Step 4b: Analytics Milestones retakes (hide E2E ghost driver rows) ────────

async function retakeMilestones(browser) {
  console.log('\n[Step 4b] Retaking analytics-milestones screenshots...');
  let captured = 0;

  for (const campus of CAMPUSES) {
    const name = `${campus}-office-analytics-milestones.png`;
    console.log(`  ${campus}...`);

    const { ctx, page } = await loginCampus(browser, campus, 'office', DESKTOP);
    try {
      await page.click('button[data-target="analytics-panel"]');
      await delay(1500);
      await page.click('button[data-analytics-tab="milestones"]');
      await delay(2000);

      // Hide E2E ghost driver rows (soft-deleted users still appear in analytics joins)
      await page.evaluate(() => {
        document.querySelectorAll('*').forEach(el => {
          if (/E2E|e2e|playwright/i.test(el.textContent) && el.children.length === 0) {
            // Walk up to find the row/card container
            let node = el.parentElement;
            while (node && node !== document.body) {
              const role = node.getAttribute('role');
              const cls = node.className || '';
              if (/row|card|item|entry|driver/i.test(cls) || role === 'row') {
                node.style.display = 'none';
                break;
              }
              node = node.parentElement;
            }
          }
        });
      });
      await delay(300);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(OUT, name), fullPage: false });
      console.log(`  [captured] ${name}`);
      captured++;
    } catch (err) {
      console.log(`  [error] ${name}: ${err.message}`);
    } finally {
      await ctx.close();
    }
  }

  console.log(`  Milestones captured: ${captured}/${CAMPUSES.length}`);
}

// ── Step 4c: Analytics Attendance retakes ─────────────────────────────────

async function retakeAttendance(browser) {
  console.log('\n[Step 4c] Retaking analytics-attendance screenshots...');
  let captured = 0;

  for (const campus of CAMPUSES) {
    const name = `${campus}-office-analytics-attendance.png`;
    console.log(`  ${campus}...`);

    const { ctx, page } = await loginCampus(browser, campus, 'office', DESKTOP);
    try {
      // Navigate to analytics panel
      await page.click('button[data-target="analytics-panel"]');
      await delay(1500);

      // Click Attendance tab
      await page.click('button[data-analytics-tab="attendance"]');
      await delay(1000);

      // Switch to "this-month" filter — contains historical clock events from seed data
      const monthBtn = await page.$('button[data-range="this-month"]');
      if (monthBtn) {
        await monthBtn.click();
        await delay(500);
      }

      // Refresh to load data
      const refreshBtn = await page.$('#analytics-refresh-btn');
      if (refreshBtn) await refreshBtn.click();

      // Wait for chart canvases to render
      await page.waitForSelector('canvas', { timeout: 8000 }).catch(() => {});
      await delay(2500);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: path.join(OUT, name), fullPage: false });
      console.log(`  [captured] ${name}`);
      captured++;
    } catch (err) {
      console.log(`  [error] ${name}: ${err.message}`);
    } finally {
      await ctx.close();
    }
  }

  console.log(`  Attendance captured: ${captured}/${CAMPUSES.length}`);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  // DB cleanup first (no browser needed)
  await cleanupE2EArtifacts();

  const browser = await chromium.launch({ headless: true });
  try {
    await retakeDriverHome(browser);
    await retakeRiderOTW(browser);
    await retakeMilestones(browser);
    await retakeAttendance(browser);
  } finally {
    await browser.close();
  }

  const allFiles = fs.readdirSync(OUT).filter(f => f.endsWith('.png'));
  console.log(`\nTotal PNG files in screenshots/: ${allFiles.length}`);
  console.log('Done. Verify the 12 retaken files visually.');
}

main().catch(err => { console.error(err); process.exit(1); });
