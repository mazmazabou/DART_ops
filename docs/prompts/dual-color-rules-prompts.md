# RideOps — Dual-Color Theming + Editable Program Rules
# Claude Code Prompts (Phase A → C)

> Work ONE phase at a time. Do NOT proceed until the current phase passes its verification checklist.
> Project: ~/Documents/Projects/RideOps/

---

## PHASE A — Campus Theme Data + Secondary Color CSS Variable

**Goal:** Update campus-themes.js with correct official school colors, add `--color-secondary`
and `--color-secondary-rgb` CSS variables, and update `applyTenantTheme()` to set them at runtime.
No visual changes yet — this just wires up the data.

### Prompt

```
You are working on the RideOps project at ~/Documents/Projects/RideOps/

## Task 1: Update public/campus-themes.js

Replace the entire contents of public/campus-themes.js with the following.
The key additions are:
- Correcting UCI's primary to #255799 (was #0064A4)
- Correcting UCI's secondary to #FECC07 (was #FFD200)
- Adding `secondaryTextColor` to every campus (used for text ON TOP of the secondary color)
- Updating Stanford's secondary to #53565A (cool grey, their official second color)
- Keeping all existing sidebar overrides

```js
/* ── Campus Themes for Demo Mode ──
   Client-side theme definitions for multi-campus demo switching.
   Stored in sessionStorage as 'ro-demo-campus'.

   secondaryColor     = the official accent/gold color
   secondaryTextColor = what text color to use ON TOP of secondaryColor for readable contrast
*/

var CAMPUS_THEMES = {
  usc: {
    orgName: 'USC DART',
    orgShortName: 'DART',
    orgTagline: 'Disabled Access to Road Transportation',
    orgInitials: 'DT',
    primaryColor: '#990000',          // USC Cardinal
    primaryLight: '#B83A4B',          // lightened cardinal for subtle use
    primaryDark: '#740000',           // darkened cardinal for hover
    secondaryColor: '#FFCC00',        // USC Gold
    secondaryTextColor: '#990000',    // Cardinal on Gold (legible, on-brand)
    sidebarBg: '#1A0000',
    sidebarText: '#C4A3A3',
    sidebarActiveBg: 'rgba(153,0,0,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://maps.usc.edu/',
    campusKey: 'usc'
  },
  stanford: {
    orgName: 'Stanford ATS',
    orgShortName: 'ATS',
    orgTagline: 'Accessible Transportation Service',
    orgInitials: 'AT',
    primaryColor: '#8C1515',          // Stanford Cardinal Red
    primaryLight: '#B83A4B',          // official Stanford Light
    primaryDark: '#820000',           // official Stanford Dark
    secondaryColor: '#53565A',        // Stanford Cool Grey 11C
    secondaryTextColor: '#FFFFFF',    // White on Cool Grey
    sidebarBg: '#1A0505',
    sidebarText: '#C4A8A8',
    sidebarActiveBg: 'rgba(140,21,21,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://campus-map.stanford.edu/',
    campusKey: 'stanford'
  },
  ucla: {
    orgName: 'UCLA BruinAccess',
    orgShortName: 'BruinAccess',
    orgTagline: 'Accessible Campus Transportation',
    orgInitials: 'BA',
    primaryColor: '#2774AE',          // UCLA Blue (Pantone 2383C)
    primaryLight: '#5A9FD4',
    primaryDark: '#025d8d',
    secondaryColor: '#FFD100',        // UCLA Gold (Pantone 109C)
    secondaryTextColor: '#2774AE',    // Blue on Gold
    sidebarBg: '#0D1B2A',
    sidebarText: '#8FAFC8',
    sidebarActiveBg: 'rgba(39,116,174,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://map.ucla.edu/',
    campusKey: 'ucla'
  },
  uci: {
    orgName: 'UCI AnteaterExpress',
    orgShortName: 'AntExpress',
    orgTagline: 'Accessible Campus Transportation',
    orgInitials: 'AE',
    primaryColor: '#255799',          // UCI Blue (PMS 7685)
    primaryLight: '#5580BB',
    primaryDark: '#1A3D70',
    secondaryColor: '#FECC07',        // UCI Gold (PMS 116)
    secondaryTextColor: '#255799',    // Blue on Gold
    sidebarBg: '#001A2E',
    sidebarText: '#7BAAC4',
    sidebarActiveBg: 'rgba(37,87,153,0.25)',
    sidebarHover: 'rgba(255,255,255,0.06)',
    sidebarBorder: 'rgba(255,255,255,0.08)',
    mapUrl: 'https://map.uci.edu/',
    campusKey: 'uci'
  }
};
```

## Task 2: Add --color-secondary and --color-secondary-rgb to :root in public/css/rideops-theme.css

In the `:root` block, directly after this line:
  --color-primary-subtle: #EEF3F8;

Add these two lines:
  --color-secondary:      #D2B48C;   /* overridden at runtime by applyTenantTheme */
  --color-secondary-rgb:  210, 180, 140;
  --color-secondary-text: #4B3A2A;   /* text color to use ON TOP of --color-secondary */

Do NOT touch any other line in the :root block.

## Task 3: Update applyTenantTheme() in public/js/rideops-utils.js

Find this block inside applyTenantTheme():

    if (config.secondaryColor) {
      root.style.setProperty('--color-accent', config.secondaryColor);
      root.style.setProperty('--color-accent-dark', shadeHex(config.secondaryColor, -20));
    }

Replace it with:

    if (config.secondaryColor) {
      root.style.setProperty('--color-accent', config.secondaryColor);
      root.style.setProperty('--color-accent-dark', shadeHex(config.secondaryColor, -20));
      root.style.setProperty('--color-secondary', config.secondaryColor);
      root.style.setProperty('--color-secondary-rgb', hexToRgb(config.secondaryColor));
    }

Then find the block inside applyTenantTheme() that handles campusKey campus theme overrides
(the block that sets sidebarBg, sidebarText, etc.). At the END of that block, after the
last `root.style.setProperty` call inside it, add:

      if (ct.secondaryTextColor) root.style.setProperty('--color-secondary-text', ct.secondaryTextColor);
      if (ct.primaryLight)       root.style.setProperty('--color-primary-light',  ct.primaryLight);
      if (ct.primaryDark)        root.style.setProperty('--color-primary-dark',   ct.primaryDark);

## Task 4: Also update DEFAULT_TENANT in server.js

Find in server.js (around line 27):
  primaryColor: '#4682B4',
  secondaryColor: '#D2B48C',

Add after secondaryColor line:
  secondaryTextColor: '#4B3A2A',

This is only used if server ever returns secondaryTextColor (future-proofing), it does NOT
change any server behavior today.

## Verification

1. node server.js starts without errors
2. Open http://localhost:3000/demo.html in browser, switch to USC — check DevTools
   Elements panel, confirm :root has --color-secondary: #FFCC00
3. Switch to UCLA — confirm --color-secondary: #FFD100
4. Switch to Stanford — confirm --color-secondary: #53565A
5. Switch to UCI — confirm --color-secondary: #FECC07
6. No console errors

## Commit

Message: "feat: add dual-color theming data — official school secondaries + CSS variables"
```

---

## PHASE B — Apply Secondary Color to UI Elements

**Goal:** Use `--color-secondary` and `--color-secondary-text` in the CSS rules that
control: active sidebar nav text, page header title, active tab text, active filter pill,
table thead row, FullCalendar navigation buttons, FullCalendar column headers,
shift band backgrounds in the time grid, and clock-in related cards.

All changes are in public/css/rideops-theme.css ONLY unless noted.
Do NOT modify server.js, app.js, or any HTML files.

### Prompt

```
You are working on the RideOps project at ~/Documents/Projects/RideOps/

Make the following TARGETED edits to public/css/rideops-theme.css.
Work through them one at a time. Do NOT rewrite the file — only edit the specific rules listed.

---

### Edit 1: Active sidebar nav item — secondary text instead of white

Find this exact line:
.ro-nav-item.active { background: var(--color-sidebar-active-bg, rgba(var(--color-primary-rgb),0.15)); color: #fff; }

Replace it with:
.ro-nav-item.active { background: var(--color-sidebar-active-bg, rgba(var(--color-primary-rgb),0.15)); color: var(--color-secondary, #fff); }

---

### Edit 2: Page header title — secondary color

Find this exact line:
.ro-header-title { font-size: 16px; font-weight: 700; margin: 0; }

Replace it with:
.ro-header-title { font-size: 16px; font-weight: 700; margin: 0; color: var(--color-secondary, var(--color-text)); }

---

### Edit 3: Active tab text and underline — secondary instead of primary

Find this exact line:
.ro-tab.active { color: var(--color-primary); font-weight: 700; border-bottom-color: var(--color-primary); }

Replace it with:
.ro-tab.active { color: var(--color-secondary, var(--color-primary)); font-weight: 700; border-bottom-color: var(--color-primary); }

---

### Edit 4: Active filter pill — primary background, secondary text

Find this exact line:
.filter-pill.active { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }

Replace it with:
.filter-pill.active { background: var(--color-primary); color: var(--color-secondary-text, #fff); border-color: var(--color-primary); }

---

### Edit 5: Table thead — primary background, secondary text

Find this exact line:
.ro-table thead { background: var(--color-surface-hover); }

Replace it with:
.ro-table thead { background: var(--color-primary); }

Find this exact line:
.ro-table th { padding: 10px 12px; text-align: left; font-weight: 600; color: var(--color-text-secondary); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--color-border); }

Replace it with:
.ro-table th { padding: 10px 12px; text-align: left; font-weight: 600; color: var(--color-secondary, #fff); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid rgba(255,255,255,0.15); }

---

### Edit 6: Time grid shift band — secondary color background

Find this exact line:
.time-grid__shift-band { position: absolute; top: 4px; bottom: 4px; border-radius: var(--radius-sm); background: var(--color-primary-subtle); border: 1px solid var(--color-primary-light); z-index: 1; pointer-events: none; }

Replace it with:
.time-grid__shift-band { position: absolute; top: 4px; bottom: 4px; border-radius: var(--radius-sm); background: rgba(var(--color-secondary-rgb, 210,180,140), 0.18); border: 1px solid rgba(var(--color-secondary-rgb, 210,180,140), 0.4); z-index: 1; pointer-events: none; }

---

### Edit 7: Time grid column separators — secondary tint

Find this exact line:
.time-grid__time-label { padding: 8px; text-align: center; color: var(--color-text-muted); font-size: 11px; font-weight: 600; border-right: 1px solid var(--color-border-light); }

Replace it with:
.time-grid__time-label { padding: 8px; text-align: center; color: var(--color-text-muted); font-size: 11px; font-weight: 600; border-right: 1px solid rgba(var(--color-secondary-rgb, 210,180,140), 0.3); }

---

### Edit 8: Bottom tab active — secondary color

Find this exact line:
.ro-bottom-tab.active { color: var(--color-primary); }

Replace it with:
.ro-bottom-tab.active { color: var(--color-secondary, var(--color-primary)); }

---

### Edit 9: FullCalendar overrides — add a NEW section at the very END of the file

Append this entire block to the end of public/css/rideops-theme.css:

/* ── FullCalendar Tenant Theming ── */

/* Navigation buttons: week / day / today / prev / next */
.fc .fc-button-primary {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-secondary, #fff) !important;
}
.fc .fc-button-primary:hover {
  background-color: var(--color-primary-dark, #36648B) !important;
  border-color: var(--color-primary-dark, #36648B) !important;
  color: var(--color-secondary, #fff) !important;
}
.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
  background-color: var(--color-primary-dark, #36648B) !important;
  border-color: var(--color-primary-dark, #36648B) !important;
  color: var(--color-secondary, #fff) !important;
}

/* Column header row (DOW M/DD) — secondary background, primary text for contrast */
.fc .fc-col-header-cell {
  background: var(--color-secondary, #D2B48C) !important;
}
.fc .fc-col-header-cell-cushion {
  color: var(--color-secondary-text, var(--color-primary)) !important;
  font-weight: 700 !important;
  font-size: 12px !important;
  padding: 6px 8px !important;
}
.fc .fc-col-header-cell-cushion:hover {
  color: var(--color-secondary-text, var(--color-primary)) !important;
  text-decoration: none !important;
}

/* Today column — slightly tinted with secondary */
.fc .fc-day-today {
  background: rgba(var(--color-secondary-rgb, 210,180,140), 0.08) !important;
}

/* Toolbar title (month/week label) */
.fc .fc-toolbar-title {
  font-size: 15px !important;
  font-weight: 700 !important;
  color: var(--color-text) !important;
}

/* Event chips — use primary color */
.fc-event {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary-dark, #36648B) !important;
  color: var(--color-secondary, #fff) !important;
}
.fc-event .fc-event-title {
  font-weight: 600 !important;
  font-size: 11px !important;
}

/* Column borders — subtle secondary tint */
.fc .fc-timegrid-col {
  border-color: rgba(var(--color-secondary-rgb, 210,180,140), 0.2) !important;
}
.fc .fc-timegrid-slot-label {
  font-size: 11px !important;
  color: var(--color-text-muted) !important;
}

---

### Edit 10: Employee chip clock-in state — secondary highlight

Find this exact line:
.emp-chip.active { border-color: var(--status-completed); box-shadow: inset 0 0 0 1px var(--status-completed); }

Replace it with:
.emp-chip.active { border-color: var(--color-secondary, var(--status-completed)); box-shadow: inset 0 0 0 1px var(--color-secondary, var(--status-completed)); background: rgba(var(--color-secondary-rgb, 210,180,140), 0.08); }

---

## Verification after all edits

1. node server.js — no errors
2. Login as office at localhost:3000
3. Default (RideOps blue): 
   - Sidebar nav active item: text is NOT white — it's the default secondary (#D2B48C tan)
   - Page header title "Dispatch" — tan colored
   - Table thead on Rides panel — blue background with tan/cream text
   - Staff panel: FullCalendar nav buttons — blue with tan text; column headers — tan background with blue text
   - Filter pills: active pill — blue bg with tan text
4. Switch campus to USC in demo mode:
   - Header title: #FFCC00 gold
   - Active tab text: gold
   - Active filter pill: cardinal bg + gold text
   - Table thead: cardinal bg + gold text
   - FullCalendar buttons: cardinal bg + gold text
   - FullCalendar column headers: gold bg + cardinal text
5. Switch to UCLA:
   - Header title: #FFD100
   - FullCalendar column headers: gold bg + blue text
6. Switch to Stanford:
   - Header title: #53565A cool grey
   - FullCalendar column headers: grey bg + white text (--color-secondary-text = #FFFFFF)
7. No console errors
8. Take a screenshot of the office view in USC mode for documentation

## Commit

Message: "feat: apply dual-color theming — secondary color on headers, tabs, table, calendar"
```

---

## PHASE C — Editable Program Rules (Rich Text Editor)

**Goal:** Replace the static hardcoded rules array with a database-backed rich text field
that office staff can edit via a Quill.js editor in the Settings panel. The same content
displays in the rules modal shown to all users (office, driver, rider).

### Prompt

```
You are working on the RideOps project at ~/Documents/Projects/RideOps/

This phase has THREE parts: database + API (server.js), settings UI (index.html + app.js),
and the modal display update (app.js + rider.html + driver.html).

---

## Part 1: Database + API — server.js

### 1a. Add program_content table to initDb()

In the `initDb()` function, inside the `schemaSql` template literal, find the end of the
CREATE TABLE statements (look for the last `CREATE TABLE IF NOT EXISTS`). After that last
CREATE TABLE block (before the closing backtick of schemaSql), add:

    CREATE TABLE IF NOT EXISTS program_content (
      id TEXT PRIMARY KEY DEFAULT 'default',
      rules_html TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

### 1b. Seed default rules HTML in seedDefaultSettings() or a new seedDefaultContent() function

Add a new function called `seedDefaultContent()` and call it from `initDb()` right after
`await seedDefaultSettings();`.

The function:

async function seedDefaultContent() {
  // Only insert if not already present
  const existing = await query("SELECT id FROM program_content WHERE id = 'default'");
  if (existing.rowCount > 0) return;

  const defaultHtml = `<h3>Program Rules &amp; Guidelines</h3>
<ul>
  <li>This is a free accessible transportation service available during operating hours, Monday&ndash;Friday.</li>
  <li>Vehicles (golf carts) are not street-legal and cannot leave campus grounds.</li>
  <li>Riders must be present at the designated pickup location at the requested time.</li>
  <li>Drivers will wait up to 5 minutes (grace period). After that, the ride may be marked as a no-show.</li>
  <li><strong>5 consecutive no-shows will result in automatic service termination.</strong> Completed rides reset the counter.</li>
</ul>`;

  await query(
    `INSERT INTO program_content (id, rules_html, updated_at) VALUES ('default', $1, NOW())`,
    [defaultHtml]
  );
}

### 1c. Add GET /api/program-rules endpoint (PUBLIC — no auth required)

Add this endpoint after the `app.get('/api/tenant-config', ...)` line (around line 729):

app.get('/api/program-rules', async (req, res) => {
  try {
    const result = await query("SELECT rules_html FROM program_content WHERE id = 'default'");
    if (!result.rowCount) return res.json({ rulesHtml: '' });
    res.json({ rulesHtml: result.rows[0].rules_html });
  } catch (err) {
    console.error('program-rules fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch rules' });
  }
});

### 1d. Add PUT /api/program-rules endpoint (office only)

Add this immediately after the GET endpoint above:

app.put('/api/program-rules', requireOffice, async (req, res) => {
  const { rulesHtml } = req.body;
  if (typeof rulesHtml !== 'string') return res.status(400).json({ error: 'rulesHtml must be a string' });
  // Basic XSS guard: disallow <script> tags
  if (/<script/i.test(rulesHtml)) return res.status(400).json({ error: 'Script tags not allowed' });
  try {
    const existing = await query("SELECT id FROM program_content WHERE id = 'default'");
    if (existing.rowCount > 0) {
      await query("UPDATE program_content SET rules_html = $1, updated_at = NOW() WHERE id = 'default'", [rulesHtml]);
    } else {
      await query("INSERT INTO program_content (id, rules_html, updated_at) VALUES ('default', $1, NOW())", [rulesHtml]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('program-rules save error:', err);
    res.status(500).json({ error: 'Failed to save rules' });
  }
});

---

## Part 2: Settings UI — index.html + app.js

### 2a. Add Quill CDN to index.html <head>

In public/index.html, inside <head>, after the FullCalendar script tag:
<link href="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.min.js"></script>

### 2b. Add "Program Guidelines" sub-tab to Settings panel in index.html

In public/index.html, find this block inside the settings panel:
  <div class="ro-tabs">
    <button class="ro-tab active" data-subtarget="admin-users-view">Users</button>
    <button class="ro-tab" data-subtarget="admin-rules-view">Business Rules</button>
    <button class="ro-tab" data-subtarget="notif-settings">Notifications</button>
  </div>

Replace it with:
  <div class="ro-tabs">
    <button class="ro-tab active" data-subtarget="admin-users-view">Users</button>
    <button class="ro-tab" data-subtarget="admin-rules-view">Business Rules</button>
    <button class="ro-tab" data-subtarget="admin-guidelines-view">Program Guidelines</button>
    <button class="ro-tab" data-subtarget="notif-settings">Notifications</button>
  </div>

Then find this line:
  <div class="sub-panel" id="notif-settings">

BEFORE it, insert:
  <div class="sub-panel" id="admin-guidelines-view">
    <div class="p-24">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div>
          <h3 class="ro-section__title" style="margin:0;">Program Rules &amp; Guidelines</h3>
          <div class="text-xs text-muted" style="margin-top:4px;">
            This content is shown to riders and drivers when they click "Program Rules".
            Supports bold, italic, bullets, and highlights.
          </div>
        </div>
        <button class="ro-btn ro-btn--primary" id="save-program-guidelines-btn" type="button">
          <i class="ti ti-device-floppy"></i> Save
        </button>
      </div>
      <div style="background:var(--color-surface); border:1px solid var(--color-border); border-radius:var(--radius-md); overflow:hidden;">
        <div id="program-guidelines-editor" style="min-height:320px; font-size:14px;"></div>
      </div>
      <div class="text-xs text-muted" style="margin-top:8px;">
        Use the toolbar to format text. Changes are saved to the database and immediately visible to all users.
      </div>
    </div>
  </div>

### 2c. Add loadProgramGuidelines() and saveProgramGuidelines() to app.js

Add these two functions to public/app.js. Place them directly after the `saveBusinessRules`
function (which ends around line 4305):

let guidelinesQuill = null;
let guidelinesLoaded = false;

async function loadProgramGuidelines() {
  if (guidelinesLoaded) return;
  guidelinesLoaded = true;

  const editorEl = document.getElementById('program-guidelines-editor');
  if (!editorEl) return;

  // Initialize Quill with full toolbar
  guidelinesQuill = new Quill('#program-guidelines-editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['clean']
      ]
    },
    placeholder: 'Enter program rules and guidelines...'
  });

  // Load existing content
  try {
    const res = await fetch('/api/program-rules');
    const data = await res.json();
    if (data.rulesHtml) {
      guidelinesQuill.root.innerHTML = data.rulesHtml;
    }
  } catch (err) {
    console.error('loadProgramGuidelines error:', err);
  }

  // Wire up save button
  const saveBtn = document.getElementById('save-program-guidelines-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveProgramGuidelines);
  }
}

async function saveProgramGuidelines() {
  if (!guidelinesQuill) return;
  const saveBtn = document.getElementById('save-program-guidelines-btn');
  if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '<i class="ti ti-loader ti-spin"></i> Saving...'; }

  const html = guidelinesQuill.root.innerHTML;
  try {
    const res = await fetch('/api/program-rules', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rulesHtml: html })
    });
    const data = await res.json();
    if (data.ok) {
      showToast('Program guidelines saved', 'success');
      // Invalidate the cached rules so modal fetches fresh content next time
      window._cachedRulesHtml = null;
    } else {
      showToast(data.error || 'Save failed', 'error');
    }
  } catch (err) {
    showToast('Failed to save guidelines', 'error');
    console.error('saveProgramGuidelines error:', err);
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = '<i class="ti ti-device-floppy"></i> Save'; }
  }
}

### 2d. Register the lazy-load click handler for the new tab in app.js

Find this block in app.js (around line 4805):

  const rulesTab = document.querySelector('.ro-tab[data-subtarget="admin-rules-view"]');
  if (rulesTab) {
    rulesTab.addEventListener('click', () => {
      if (!businessRulesLoaded) {
        businessRulesLoaded = true;
        loadBusinessRules();
      }
    });
  }

After it (not inside it), add:

  const guidelinesTab = document.querySelector('.ro-tab[data-subtarget="admin-guidelines-view"]');
  if (guidelinesTab) {
    guidelinesTab.addEventListener('click', () => {
      loadProgramGuidelines();
    });
  }

---

## Part 3: Update showRulesModal() to display DB content — app.js

### 3a. Replace the static showRulesModal() function in app.js

Find this entire function in app.js (around line 2850):

function showRulesModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box" style="max-width:600px;">
      <div class="modal-title">Program Rules &amp; Guidelines</div>
      <ul style="padding-left:20px; line-height:1.8; color:var(--muted); font-size:14px;">
        ${(tenantConfig?.rules || [
          'This is a free accessible transportation service available during operating hours, Monday\u2013Friday.',
          'Vehicles cannot leave campus grounds.',
          'Riders must be present at the designated pickup location at the requested time.',
          'Drivers will wait up to 5 minutes (grace period). After that, the ride may be marked as a no-show.',
          'Service is automatically terminated after 5 consecutive missed pick-ups.'
        ]).map(r => `<li>${r}</li>`).join('')}
      </ul>
      <div class="modal-actions">
        <button class="btn primary modal-close-btn">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  const close = () => {
    overlay.classList.remove('show');
    overlay.classList.add('hiding');
    setTimeout(() => overlay.remove(), 200);
  };
  overlay.querySelector('.modal-close-btn').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

Replace the ENTIRE function with:

// Cache so we don't re-fetch on every click
window._cachedRulesHtml = null;

async function showRulesModal() {
  // Show modal immediately with loading state
  const overlay = document.createElement('div');
  overlay.className = 'ro-modal-overlay open';
  overlay.innerHTML = `
    <div class="ro-modal" style="max-width:600px; width:92%;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <div class="ro-modal__title" style="margin:0;">Program Rules &amp; Guidelines</div>
        <button class="ro-btn ro-btn--outline ro-btn--sm modal-close-btn">✕ Close</button>
      </div>
      <div id="rules-modal-body" style="font-size:14px; line-height:1.8; color:var(--color-text); max-height:65vh; overflow-y:auto;">
        <div class="text-muted text-sm">Loading...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.modal-close-btn').onclick = close;
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  // Fetch and display rules
  try {
    if (!window._cachedRulesHtml) {
      const res = await fetch('/api/program-rules');
      const data = await res.json();
      window._cachedRulesHtml = data.rulesHtml || '';
    }
    const body = overlay.querySelector('#rules-modal-body');
    if (body) {
      if (window._cachedRulesHtml) {
        body.innerHTML = window._cachedRulesHtml;
      } else {
        // Fallback to tenant config rules array if DB is empty
        const fallbackRules = window.tenantConfig?.rules || [
          'This is a free accessible transportation service available during operating hours, Monday–Friday.',
          'Vehicles cannot leave campus grounds.',
          'Riders must be present at the designated pickup location at the requested time.',
          'Drivers will wait up to 5 minutes. After that, the ride may be marked as a no-show.',
          '5 consecutive no-shows result in automatic service termination.'
        ];
        body.innerHTML = '<ul style="padding-left:20px;">' +
          fallbackRules.map(r => '<li>' + r + '</li>').join('') + '</ul>';
      }
    }
  } catch (err) {
    const body = overlay.querySelector('#rules-modal-body');
    if (body) body.innerHTML = '<p class="text-muted">Could not load rules. Please try again.</p>';
    console.error('showRulesModal fetch error:', err);
  }
}

---

## Part 4: Update rules modal in rider.html and driver.html

These pages also have a rules modal or rules button. Search both files for any function
or button that shows program rules, and update them to use the same fetch-from-API approach.

In rider.html and driver.html, search for any function showing rules (look for `rules`,
`modal`, `guidelines`). If found, replace the static rules display with:

async function showRulesModal() {
  const overlay = document.createElement('div');
  overlay.className = 'ro-modal-overlay open';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:150;display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML = `
    <div style="background:var(--color-surface);border-radius:var(--radius-lg);padding:24px;max-width:560px;width:92%;box-shadow:var(--shadow-lg);max-height:85vh;display:flex;flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <span style="font-size:16px;font-weight:700;">Program Rules &amp; Guidelines</span>
        <button class="ro-btn ro-btn--outline ro-btn--sm" onclick="this.closest('.ro-modal-overlay').remove()">✕</button>
      </div>
      <div id="rules-body" style="font-size:14px;line-height:1.8;overflow-y:auto;color:var(--color-text);">
        <div style="color:var(--color-text-muted);font-size:12px;">Loading...</div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  try {
    const data = await fetch('/api/program-rules').then(r => r.json());
    const body = overlay.querySelector('#rules-body');
    if (body) body.innerHTML = data.rulesHtml || '<p>No rules available.</p>';
  } catch (e) {
    const body = overlay.querySelector('#rules-body');
    if (body) body.innerHTML = '<p style="color:var(--color-text-muted);">Could not load rules.</p>';
  }
}

If rider.html or driver.html do NOT have a rules modal function, skip Part 4 for that file
(do not add one that doesn't exist).

---

## Quill CSS override — add to public/css/rideops-theme.css

Append to the end of rideops-theme.css (after the FullCalendar overrides from Phase B):

/* ── Quill Editor Theming ── */
.ql-toolbar.ql-snow {
  border-color: var(--color-border) !important;
  background: var(--color-surface-hover);
  font-family: inherit !important;
}
.ql-container.ql-snow {
  border-color: var(--color-border) !important;
  font-family: inherit !important;
  font-size: 14px !important;
}
.ql-editor { min-height: 280px; }
.ql-editor p, .ql-editor li { line-height: 1.8; }
.ql-toolbar .ql-stroke { stroke: var(--color-text-secondary) !important; }
.ql-toolbar .ql-fill  { fill: var(--color-text-secondary) !important; }
.ql-toolbar button:hover .ql-stroke { stroke: var(--color-primary) !important; }
.ql-toolbar button.ql-active .ql-stroke { stroke: var(--color-primary) !important; }
.ql-toolbar button.ql-active .ql-fill  { fill: var(--color-primary) !important; }

---

## Verification

1. node server.js — no errors, DB migration runs cleanly
2. Login as office at localhost:3000
3. Navigate to Settings → Program Guidelines:
   - Quill editor renders with toolbar (bold/italic/bullet/color/highlight buttons)
   - Default content is pre-loaded in the editor
   - Type some text, add a bold word, add a highlighted sentence
   - Click Save → toast says "Program guidelines saved"
4. Click the book icon in the sidebar footer (showRulesModal):
   - Modal opens with the content you just saved (not the old static list)
   - Rich text formatting (bold, bullets) renders correctly in the modal
5. Open a different browser tab, go to localhost:3000/rider.html, log in as a rider
   - If there is a "Program Rules" button/link, click it — same content should show
6. Reload the office page, go to Settings → Program Guidelines — edited content persists
7. No console errors

## Commit

Message: "feat: editable program rules with Quill rich text editor and DB persistence"
```

---

## APPENDIX: Reference — Official School Colors

| School      | Primary             | Secondary           | Secondary Text On Secondary |
|-------------|---------------------|---------------------|-----------------------------|
| RideOps     | #4682B4 (steel blue)| #D2B48C (tan)       | #4B3A2A                     |
| USC         | #990000 (cardinal)  | #FFCC00 (gold)      | #990000 (cardinal)          |
| Stanford    | #8C1515 (cardinal)  | #53565A (cool grey) | #FFFFFF (white)             |
| UCLA        | #2774AE (blue)      | #FFD100 (gold)      | #2774AE (blue)              |
| UCI         | #255799 (blue)      | #FECC07 (gold)      | #255799 (blue)              |

### Stanford additional palette (for future use)
- Light: #B83A4B
- Dark: #820000
- Black: #2E2D29
- Cool Grey: #53565A

### Notes
- For gold/yellow secondaries: always use the primary color as text on top
- For dark secondaries (Stanford grey): white text
- --color-secondary-text is the CSS variable that controls this automatically
- Status colors (pending/approved/completed/etc.) are NEVER overridden by tenant theming
