const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

const BASE = 'http://localhost:3000';
const OUT  = path.join(__dirname, 'linkedin_screenshots');
fs.mkdirSync(OUT, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: path.join(OUT, name + '.png') });
  console.log('  ✓', name);
}

async function cap(page, t, s) {
  await page.evaluate(([t, s]) => {
    document.querySelectorAll('#_c').forEach(e => e.remove());
    const el = document.createElement('div');
    el.id = '_c';
    el.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(153,0,0,0.92);color:#fff;padding:11px 26px;border-radius:40px;font:600 14px/1.5 Arial,sans-serif;z-index:99999;text-align:center;box-shadow:0 4px 24px rgba(0,0,0,.40);pointer-events:none;white-space:nowrap;';
    el.innerHTML = t + (s ? `<br><span style="font-weight:400;font-size:11px;opacity:.85">${s}</span>` : '');
    document.body.appendChild(el);
  }, [t, s || '']);
  await page.waitForTimeout(150);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const p = await browser.newPage();
  await p.setViewportSize({ width: 1440, height: 900 });

  // Login
  await p.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await p.locator('#username').fill('office');
  await p.locator('#password').fill('demo123');
  await p.locator('button[type=submit]').click();
  await p.waitForURL(u => !u.toString().includes('/login'), { timeout: 10000 });
  await p.waitForLoadState('networkidle');
  await p.waitForTimeout(800);
  console.log('  → logged in:', p.url());

  // Navigate to Staff panel
  const clicked = await p.evaluate(() => {
    const el = document.querySelector('[data-panel="staff"]')
      || [...document.querySelectorAll('nav li, .sidebar-nav a, nav a, li')]
           .find(n => n.textContent.trim().toLowerCase().startsWith('staff'));
    if (el) { el.click(); return true; }
    return false;
  });
  if (!clicked) await p.locator('text=Staff').first().click({ timeout: 3000 });
  await p.waitForTimeout(1200);
  console.log('  → navigated to staff panel');

  // Navigate FullCalendar to the week of Feb 16–20 2026
  // Keep clicking "prev" until we see "Feb 2026" with Mon Feb 16
  // Or click "today" first then go back as needed.
  // Strategy: use the prev/next buttons on the FullCalendar toolbar.
  // First find what week is currently shown, then navigate.
  for (let i = 0; i < 10; i++) {
    const titleText = await p.evaluate(() => {
      const el = document.querySelector('.fc-toolbar-title, .fc-header-toolbar .fc-title, h2.fc-toolbar-title');
      return el ? el.textContent.trim() : '';
    });
    console.log('  calendar title:', titleText);

    // Check if we're on the right week (Feb 16 visible)
    const hasTarget = await p.evaluate(() => {
      // Look for a day cell with Feb 16
      const cells = [...document.querySelectorAll('.fc-col-header-cell, .fc-day, [data-date]')];
      return cells.some(c => {
        const d = c.getAttribute('data-date') || c.textContent;
        return d && d.includes('2026-02-16');
      });
    });

    if (hasTarget) {
      console.log('  ✓ target week found');
      break;
    }

    // Determine direction — parse the title or check a data-date
    const currentDate = await p.evaluate(() => {
      const el = document.querySelector('[data-date]');
      return el ? el.getAttribute('data-date') : null;
    });
    console.log('  sample data-date:', currentDate);

    // If current date > Feb 20, go prev; if < Feb 16, go next
    if (currentDate) {
      const d = new Date(currentDate);
      const target = new Date('2026-02-16');
      if (d > new Date('2026-02-20')) {
        // go prev
        await p.locator('.fc-prev-button, button[title="prev"], button[aria-label="prev"]').first().click();
      } else {
        // go next
        await p.locator('.fc-next-button, button[title="next"], button[aria-label="next"]').first().click();
      }
    } else {
      // Just go prev as a guess
      await p.locator('.fc-prev-button, .fc-button[aria-label*="prev"]').first().click();
    }
    await p.waitForTimeout(600);
  }

  await p.waitForTimeout(800);

  await cap(p,
    '📅  Staff & Shifts — Drag, Drop & Right-Click',
    'Shift blocks move across days or reorder within a day · Right-click for duplicate, edit & delete'
  );
  await shot(p, '05_office_staff');

  await browser.close();
  console.log('\n✅ Done — 05_office_staff.png updated in', OUT);
})();
