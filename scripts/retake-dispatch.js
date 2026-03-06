#!/usr/bin/env node
'use strict';

// =============================================================================
// Retake dispatch screenshots for all 4 campuses
// =============================================================================
// Prerequisite: node scripts/prep-dispatch-data.js (seeds clean dispatch state)
//
// Usage: node scripts/retake-dispatch.js
// =============================================================================

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CAMPUSES = ['usc', 'ucla', 'stanford', 'uci'];
const BASE = 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'screenshots');
const DESKTOP = { width: 1920, height: 1080 };

// Inject saved widget layouts (same as take-screenshots.js)
const SAVED_LAYOUTS = {
  'rideops_widget_layout_dashboard_office': '{"version":11,"widgets":[{"id":"kpi-total-rides","x":0,"y":0,"w":2,"h":1},{"id":"kpi-completion-rate","x":2,"y":0,"w":2,"h":1},{"id":"kpi-no-show-rate","x":4,"y":0,"w":2,"h":1},{"id":"kpi-active-riders","x":6,"y":0,"w":2,"h":1},{"id":"kpi-driver-punctuality","x":8,"y":0,"w":2,"h":1},{"id":"kpi-fleet-available","x":10,"y":0,"w":2,"h":1},{"id":"ride-volume","x":1,"y":1,"w":3,"h":3},{"id":"ride-outcomes","x":7,"y":1,"w":2,"h":3},{"id":"rides-by-dow","x":4,"y":1,"w":3,"h":3},{"id":"rides-by-hour","x":1,"y":4,"w":4,"h":3},{"id":"top-routes","x":5,"y":4,"w":4,"h":6},{"id":"driver-leaderboard","x":1,"y":7,"w":4,"h":3},{"id":"shift-coverage","x":9,"y":1,"w":3,"h":6},{"id":"fleet-utilization","x":9,"y":7,"w":3,"h":4},{"id":"rider-cohorts","x":0,"y":1,"w":1,"h":8},{"id":"peak-hours","x":0,"y":10,"w":4,"h":5}]}',
  'rideops_widget_custom_default_dashboard_office': '{"version":11,"widgets":[{"id":"kpi-total-rides","x":0,"y":0,"w":2,"h":1},{"id":"kpi-completion-rate","x":2,"y":0,"w":2,"h":1},{"id":"kpi-no-show-rate","x":4,"y":0,"w":2,"h":1},{"id":"kpi-active-riders","x":6,"y":0,"w":2,"h":1},{"id":"kpi-driver-punctuality","x":8,"y":0,"w":2,"h":1},{"id":"kpi-fleet-available","x":10,"y":0,"w":2,"h":1},{"id":"ride-volume","x":1,"y":1,"w":3,"h":3},{"id":"ride-outcomes","x":7,"y":1,"w":2,"h":3},{"id":"rides-by-dow","x":4,"y":1,"w":3,"h":3},{"id":"rides-by-hour","x":1,"y":4,"w":4,"h":3},{"id":"top-routes","x":5,"y":4,"w":4,"h":6},{"id":"driver-leaderboard","x":1,"y":7,"w":4,"h":3},{"id":"shift-coverage","x":9,"y":1,"w":3,"h":6},{"id":"fleet-utilization","x":9,"y":7,"w":3,"h":4},{"id":"rider-cohorts","x":0,"y":1,"w":1,"h":8},{"id":"peak-hours","x":0,"y":10,"w":4,"h":5}]}',
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function hideE2EDispatchRows(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.time-grid__row').forEach(row => {
      const text = row.textContent || '';
      if (/E2E|e2e|test_/i.test(text)) row.style.display = 'none';
    });
    document.querySelectorAll('.time-grid__separator').forEach(sep => {
      if (sep.textContent && sep.textContent.includes('Off Shift')) {
        let sibling = sep.nextElementSibling;
        let hasVisible = false;
        while (sibling && sibling.classList.contains('time-grid__row')) {
          if (sibling.style.display !== 'none') hasVisible = true;
          sibling = sibling.nextElementSibling;
        }
        if (!hasVisible) sep.style.display = 'none';
      }
    });
  });
}

async function retakeDispatch(browser, campus) {
  console.log(`  [${campus.toUpperCase()}] logging in as office...`);

  const ctx = await browser.newContext({ viewport: DESKTOP });
  const page = await ctx.newPage();

  try {
    await page.goto(`${BASE}/${campus}/login`, { waitUntil: 'domcontentloaded' });

    // Inject localStorage (widget layouts) before logging in
    await page.evaluate((ls) => {
      Object.entries(ls).forEach(([k, v]) => localStorage.setItem(k, v));
    }, SAVED_LAYOUTS);

    await page.waitForSelector('#username', { timeout: 8000 });
    await page.fill('#username', 'office');
    await page.fill('#password', 'demo123');

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
      page.click('button[type="submit"]'),
    ]);
    await page.waitForLoadState('networkidle').catch(() => {});
    await delay(800);

    // Default panel is dispatch — wait for KPI bar + grid to populate via 5s polling
    await page.waitForSelector('.kpi-card, .kpi-bar, .time-grid__row', { timeout: 8000 }).catch(() => {});
    await delay(3000); // Wait for 5s poll cycle to populate grid with rides

    await hideE2EDispatchRows(page);
    await delay(300);

    await page.evaluate(() => window.scrollTo(0, 0));
    const filePath = path.join(OUT, `${campus}-office-dispatch.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`  [${campus.toUpperCase()}] captured ${campus}-office-dispatch.png`);

  } finally {
    await ctx.close();
  }
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  // Health check
  try {
    const res = await fetch(`${BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    console.log('[OK] Server running at', BASE);
  } catch {
    console.error('[FAIL] Server not running at', BASE);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (const campus of CAMPUSES) {
      await retakeDispatch(browser, campus);
    }
  } finally {
    await browser.close();
  }

  console.log('\n[done] All 4 dispatch screenshots retaken.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
