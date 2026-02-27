# Claude Code Prompt: Analytics Page Complete Redesign

Read CLAUDE.md first for full project context. Then read this entire prompt before writing any code.

## Critical Context

The analytics section was recently redesigned but the result has serious issues. The user provided screenshots showing specific problems. This prompt addresses every one of them plus adds innovation where it was missing.

## Rules

- Pure HTML/CSS/SVG + vanilla JS. NO charting libraries.
- All colors via CSS custom properties from `rideops-theme.css`. Never hardcode hex in JS/HTML.
- Tabler Icons only (`ti ti-*`).
- Every interactive chart element: hover tooltips via existing `showChartTooltip()` / `hideChartTooltip()` / `positionChartTooltip()`. Tooltips always show label + absolute value + percentage of total where applicable.
- CommonJS only.
- Keep all existing API data shapes — do NOT change backend endpoints unless explicitly noted in this prompt.
- Mobile responsive.

## Files to Modify
- `public/app.js` — rendering functions
- `public/css/rideops-theme.css` — styles
- `server.js` — only where explicitly noted
- `public/index.html` — layout restructuring for the analytics panel

---

## ISSUE 1: Broken Refresh Button for Date Filtering

The date range filter (From/To inputs + Refresh button) in the analytics Dashboard sub-tab does not propagate to other sub-tabs when they're viewed after changing dates.

**Root cause:** The date inputs are INSIDE `#analytics-dashboard-view` (a sub-panel). When the user switches to another sub-tab like Tardiness, the date inputs are still in the Dashboard sub-panel and work fine — BUT the user may not realize they need to go back to Dashboard to change dates. More critically, **if the refresh button re-renders all analytics, the sub-panels that are `display:none` may not render their charts correctly since their containers aren't visible.**

**Fix:**
Move the date filter bar OUT of the Dashboard sub-panel and into the analytics panel header, so it's always visible regardless of which sub-tab is active.

In `index.html`, move the date filter from inside `#analytics-dashboard-view` to just below the `.ro-tabs` container but above the sub-panels:

```html
<section class="tab-panel" id="analytics-panel">
  <div class="ro-tabs">
    <button class="ro-tab active" data-subtarget="analytics-dashboard-view">Dashboard</button>
    <!-- ...other tabs... -->
  </div>

  <!-- DATE FILTER: now visible across all sub-tabs -->
  <div class="analytics-date-bar">
    <div class="flex gap-8 items-center">
      <label class="ro-label" style="margin:0;">From</label>
      <input type="date" id="analytics-from" class="ro-input" style="width:auto;">
      <label class="ro-label" style="margin:0;">To</label>
      <input type="date" id="analytics-to" class="ro-input" style="width:auto;">
      <button class="ro-btn ro-btn--outline ro-btn--sm" id="analytics-refresh-btn" type="button"><i class="ti ti-refresh"></i> Refresh</button>
    </div>
  </div>

  <div class="sub-panel active" id="analytics-dashboard-view">
    <!-- Remove the old date filter section from here -->
    <!-- ...rest of dashboard content... -->
```

Add CSS:
```css
.analytics-date-bar {
  padding: 8px 24px;
  display: flex;
  justify-content: flex-end;
  border-bottom: 1px solid var(--color-border-light);
  background: var(--color-surface);
}
```

Remove the old `<div class="flex items-center justify-between mb-16">` wrapper containing the "Overview" heading and date inputs from inside the dashboard sub-panel. The "Overview" heading can stay or be removed (the tab already says "Dashboard").

---

## ISSUE 2: Ugly Line Chart ("Daily Volume (Recent)")

The line chart has multiple visual problems:
- Too many visible dots cluttering the chart (every single data point has a visible r=3 circle)
- Area fill at 12% opacity is nearly invisible — looks like nothing is there
- Straight line segments make it look jagged and amateurish
- The chart is too short (H=200) relative to its width, making it feel squashed
- No gradient on the area fill — just flat color

**Fix in `renderLineChart()`:**

a) **Hide dots by default, show only on hover.** Change dots to `opacity="0"` initially, then on mousemove set nearest dot to opacity 1 and r=5:
```javascript
const dots = points.map((p, i) =>
  `<circle cx="${p.x}" cy="${p.y}" r="0" fill="${lineColor}" stroke="var(--color-surface)" stroke-width="2" class="area-dot" data-idx="${i}"/>`
).join('');
```
In the mousemove handler, set `nearest` dot to `r="5"` and `opacity="1"`, all others stay at `r="0"`.

b) **Increase area fill opacity to 0.18-0.20** and add SVG gradient that fades from color at top to transparent at bottom:
```javascript
const gradientId = containerId + '-gradient';
const gradient = `<defs><linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.25"/>
  <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.02"/>
</linearGradient></defs>`;
// Use: fill="url(#${gradientId})" on the area path instead of flat opacity
```

c) **Use smooth monotone cubic interpolation** instead of straight lines. This doesn't imply false continuity — it just makes the chart not look like a child drew it. Use catmull-rom or simple control point interpolation:
```javascript
// For each point, compute a control point
// Simple approach: control point x is midpoint, control point y is current point's y
let linePath = `M ${points[0].x} ${points[0].y}`;
for (let i = 1; i < points.length; i++) {
  const prev = points[i - 1];
  const curr = points[i];
  const cpx = (prev.x + curr.x) / 2;
  linePath += ` C ${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
}
```

d) **Increase chart height** from `H=200` to `H=260`. This gives the data more vertical breathing room.

e) **Increase stroke width** from 2 to 2.5:
```css
.line-chart-wrap .chart-line { stroke-width: 2.5; }
```

f) **Soften gridlines** — change grid-line stroke to be even more subtle:
```css
.line-chart-wrap .grid-line { stroke: var(--color-border-light); stroke-width: 1; opacity: 0.6; }
```

---

## ISSUE 3: Everything Feels Oversized

The user says everything feels oversized. Looking at the screenshots and code, the issue is NOT padding — it's that **each chart section takes full width with large section titles, creating a long scrolling page where each chart is a massive block.** The Creatio CRM style the user wants is a **card-based grid** where multiple visualizations sit side by side.

**Fix: Restructure the Dashboard sub-tab into a card grid layout.**

Replace the current stacked layout:
```
[KPI cards - full width]
[Day of Week chart - full width]
[Hour chart - full width]
[Daily Volume chart - full width]
[Status Breakdown - full width]
```

With a Creatio-style card grid:
```
[KPI cards - full width row]
[Day of Week CARD] [Hour of Day CARD]     ← 2-column row
[Daily Volume CARD - full width]           ← full width (time series needs space)
[Status Breakdown CARD]                    ← full width or half
```

**In `index.html`, restructure the dashboard sub-panel:**
```html
<div class="sub-panel active" id="analytics-dashboard-view">
  <div class="kpi-bar" id="analytics-kpi-grid"></div>
  <div class="analytics-card-grid">
    <div class="analytics-card">
      <div class="analytics-card__header">
        <h4 class="analytics-card__title">Rides by Day of Week</h4>
      </div>
      <div class="analytics-card__body" id="chart-dow"></div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card__header">
        <h4 class="analytics-card__title">Rides by Hour</h4>
      </div>
      <div class="analytics-card__body" id="chart-hour"></div>
    </div>
    <div class="analytics-card analytics-card--wide">
      <div class="analytics-card__header">
        <h4 class="analytics-card__title">Daily Volume (Recent)</h4>
      </div>
      <div class="analytics-card__body" id="chart-daily"></div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card__header">
        <h4 class="analytics-card__title">Status Breakdown</h4>
      </div>
      <div class="analytics-card__body" id="chart-status"></div>
    </div>
  </div>
</div>
```

**Add CSS for the card grid:**
```css
.analytics-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 24px 24px;
}

.analytics-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.analytics-card--wide {
  grid-column: 1 / -1; /* spans full width */
}

.analytics-card__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
}

.analytics-card__title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.analytics-card__body {
  padding: 12px 16px 16px;
}

@media (max-width: 768px) {
  .analytics-card-grid { grid-template-columns: 1fr; }
  .analytics-card--wide { grid-column: 1; }
}
```

Remove the old `<div class="ro-section">` wrappers and `<h3 class="ro-section__title mb-8">` elements that wrapped each chart — those are replaced by the card structure.

**Also adjust the column chart viewBox** to be shorter since it's inside a card now: change `H = 220` to `H = 180` in `renderColumnChart`. The reduced height fits better in a card layout.

---

## ISSUE 4: Remove "On the Way" and "5-min Grace" from Status Breakdown

These are in-progress transient statuses that clutter the status breakdown. The user only wants to see terminal/meaningful statuses.

**Fix in `loadAnalyticsFrequency()`:**
After receiving `data.byStatus`, filter out the transient statuses before passing to `renderStackedBar`:

```javascript
const hiddenStatuses = ['driver_on_the_way', 'driver_arrived_grace'];
const statusSegments = data.byStatus
  .filter(r => !hiddenStatuses.includes(r.status))
  .map(r => ({
    label: statusLabel(r.status),
    count: parseInt(r.count) || 0,
    color: getStatusColor(r.status)
  }));
renderStackedBar('chart-status', statusSegments, { unit: 'rides' });
```

---

## ISSUE 5: Milestones — Squeeze All Tiers on One Line

Currently 5 milestone badges (50, 100, 250, 500, 1000) wrap because the card is too narrow and badges are too wide. Diamond (1000) ends up alone on a second line.

**Fix:** Make badges more compact. The current badge format is `<icon> 50`, `<icon> 100` etc. with padding `2px 6px`. Reduce badge size and use tighter spacing:

```css
.milestone-badges {
  display: flex;
  gap: 3px;
  flex-wrap: nowrap; /* PREVENT wrapping */
  margin-top: 6px;
  overflow-x: auto; /* scroll if truly needed on very small screens */
}

.milestone-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  flex-shrink: 0;
}
```

Also in `renderMilestoneList()`, shorten the badge labels — don't show the number, just the icon. The milestone threshold is already visible in the `title` attribute tooltip:

```javascript
// BEFORE:
`<span class="milestone-badge${earned ? ' earned' : ''}" title="${badgeLabels[m]}">${badgeIcons[m]} ${m}</span>`

// AFTER (shorter):
`<span class="milestone-badge${earned ? ' earned' : ''}" title="${badgeLabels[m]} (${m} rides)">${badgeIcons[m]}${m}</span>`
```

The key fix is `flex-wrap: nowrap` so all 5 badges are forced onto one line.

---

## ISSUE 6: Semester Report — Round the Delta to 2 Decimal Places

The delta function at line 3242 outputs `Math.abs(diff)` without formatting. When `completionRate` is a float like `87.5`, subtracting two floats gives floating-point artifacts like `4.699999999999998`.

**Fix in the `delta()` function inside `renderSemesterReport()`:**

```javascript
function delta(curr, prev) {
  if (!prev || prev === 0) return '';
  const diff = curr - prev;
  if (diff === 0) return '';
  const arrow = diff > 0 ? 'ti-arrow-up' : 'ti-arrow-down';
  const cls = diff > 0 ? 'delta--up' : 'delta--down';
  // Round to 2 decimal places, strip trailing zeros
  const formatted = parseFloat(Math.abs(diff).toFixed(2));
  return `<span class="delta ${cls}"><i class="ti ${arrow}"></i>${formatted}</span>`;
}
```

---

## ISSUE 7: Semester Report — Previous on Left, Current on Right

The user wants previous semester on the left (for chronological reading) and current on the right (the "result" / "where we are now"). Currently it's reversed.

**Fix in `renderSemesterReport()`:**

Change the order in the innerHTML:
```javascript
container.innerHTML = `
  <div class="semester-comparison">
    ${statBlock(data.previous, data.previousLabel + ' (Previous)')}
    ${statBlock(data.current, data.semesterLabel + ' (Current)', data.previous)}
  </div>
  ${monthlyTable}
  ${leaderboard}
`;
```

Note: The `prevStats` argument for delta computation now goes on the SECOND call (current), since that's the one showing deltas relative to previous.

---

## ISSUE 8: 24 Tardies in One Day — Data Quality Issue

This is a demo seed data problem. The `demo-seed.js` file does NOT seed `clock_events`, so any tardiness data comes from manual testing. The "24 tardies in a day" is unrealistic test data.

**Fix:** Add realistic clock_events seeding to `demo-seed.js`.

After the existing ride seeding logic, add a section that creates realistic clock events for each driver over the past 30 days:

```javascript
// Seed clock events for tardiness analytics
const drivers = await query(`SELECT id, name FROM users WHERE role = 'driver'`);
const today = new Date();
for (const driver of drivers.rows) {
  for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
    const eventDate = new Date(today);
    eventDate.setDate(eventDate.getDate() - daysAgo);
    const dow = eventDate.getDay();
    if (dow === 0 || dow === 6) continue; // Skip weekends

    // 80% chance of showing up each day
    if (Math.random() > 0.8) continue;

    const scheduledStart = '08:00:00';
    // 75% on time, 25% tardy (1-20 min late)
    const tardiness = Math.random() < 0.75 ? 0 : Math.floor(Math.random() * 20) + 1;
    const clockInTime = new Date(eventDate);
    clockInTime.setHours(8, tardiness, 0);

    await query(
      `INSERT INTO clock_events (id, employee_id, shift_id, event_date, scheduled_start, clock_in_at, tardiness_minutes, created_at)
       VALUES ($1, $2, NULL, $3, $4, $5, $6, NOW())
       ON CONFLICT DO NOTHING`,
      [generateId('clk'), driver.id, eventDate.toISOString().split('T')[0], scheduledStart, clockInTime.toISOString(), tardiness]
    );
  }
}
```

This creates realistic data: ~4 drivers × ~22 working days = ~88 clock events with ~22 tardy ones (25% tardy rate), distributed across days, max 1 tardy event per driver per day.

---

## ISSUE 9: Dashboard Should Look Like Creatio CRM Style — Cards with Embedded Visualizations

The user references both the existing dashboard screenshot AND Creatio CRM dashboards. The key Creatio pattern:
- **Widget cards** with their own title bar, each containing a self-contained visualization
- **Grid layout** where cards sit side by side (2-3 per row)
- **Metric widgets** (single big number + trend), **Chart widgets** (column/line/pie), **List widgets** (ranked items)
- Cards have subtle borders and rounded corners, consistent spacing

This is already addressed by ISSUE 3's card grid, but here are additional details:

**KPI cards should also be in the card style** — add a subtle card wrapper around the KPI bar:
```html
<div class="analytics-card analytics-card--wide analytics-card--kpi">
  <div class="kpi-bar" id="analytics-kpi-grid"></div>
</div>
```

```css
.analytics-card--kpi {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  margin: 0 24px 16px;
}
```

**Make the KPI cards themselves more compact** — currently `.kpi-card` has `padding: 16px 20px`. Reduce:
```css
.kpi-card { padding: 12px 16px; min-width: 100px; }
.kpi-card__value, .kpi-value { font-size: 22px; } /* was likely larger */
.kpi-card__label, .kpi-label { font-size: 11px; }
```

---

## ISSUE 10: No Innovation in Hotspots

The hotspots tab is three identical ranked horizontal bar lists — Top Pickups, Top Dropoffs, and Most Popular Routes. Zero visual differentiation or innovation.

**Fix: Add an Origin-Destination Matrix Heatmap for routes, and improve the location lists.**

### 10a. Restructure Hotspots layout in `index.html`:

```html
<div class="sub-panel" id="analytics-hotspots-view">
  <div class="analytics-card-grid" style="padding: 16px 24px;">
    <div class="analytics-card">
      <div class="analytics-card__header"><h4 class="analytics-card__title"><i class="ti ti-map-pin"></i> Top Pickup Locations</h4></div>
      <div class="analytics-card__body" id="hotspot-pickups"></div>
    </div>
    <div class="analytics-card">
      <div class="analytics-card__header"><h4 class="analytics-card__title"><i class="ti ti-map-pin-filled"></i> Top Dropoff Locations</h4></div>
      <div class="analytics-card__body" id="hotspot-dropoffs"></div>
    </div>
    <div class="analytics-card analytics-card--wide">
      <div class="analytics-card__header"><h4 class="analytics-card__title"><i class="ti ti-route"></i> Route Demand Matrix</h4></div>
      <div class="analytics-card__body" id="hotspot-matrix"></div>
    </div>
    <div class="analytics-card analytics-card--wide">
      <div class="analytics-card__header"><h4 class="analytics-card__title"><i class="ti ti-trending-up"></i> Most Popular Routes</h4></div>
      <div class="analytics-card__body" id="hotspot-routes"></div>
    </div>
  </div>
</div>
```

### 10b. Add a new backend endpoint for the OD matrix

In `server.js`, add a new query inside the existing `/api/analytics/hotspots` handler. After the existing three queries, add a fourth:

```javascript
// Inside the existing hotspots endpoint, add to the Promise.all:
query(
  `SELECT pickup_location, dropoff_location, COUNT(*) AS count
   FROM rides WHERE 1=1 ${clause} ${statusFilter}
   GROUP BY pickup_location, dropoff_location
   ORDER BY count DESC LIMIT 50`, params
)
```

Return it as `matrix` in the response:
```javascript
res.json({
  topPickups: pickupRes.rows,
  topDropoffs: dropoffRes.rows,
  topRoutes: routeRes.rows,
  matrix: matrixRes.rows // new
});
```

### 10c. Build the OD Matrix renderer

Create a new function `renderODMatrix(containerId, matrixData, topPickups, topDropoffs)`:

- Extract unique pickup locations (rows) and dropoff locations (columns) from the matrix data. Limit to top 8 of each to keep the grid readable.
- Build an HTML table where:
  - Header row = dropoff location names (abbreviated to first 15 chars)
  - First column = pickup location names
  - Each cell = ride count between that pickup-dropoff pair
  - Cell background color = intensity based on count (use CSS custom property `--color-primary` with varying opacity: `rgba(var(--color-primary-rgb), ${intensity})` where intensity = count/maxCount)
  - Empty cells (0 rides) get no background
- Hover on any cell: tooltip shows "From: [Pickup] → To: [Dropoff]: X rides (Y% of all routes)"
- Click on any non-zero cell could optionally highlight the corresponding row/column

CSS:
```css
.od-matrix {
  width: 100%;
  border-collapse: separate;
  border-spacing: 2px;
  font-size: 11px;
}
.od-matrix th {
  padding: 4px 6px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 10px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.od-matrix .od-row-header {
  text-align: right;
  padding-right: 8px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 10px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.od-matrix .od-cell {
  text-align: center;
  padding: 6px 4px;
  border-radius: 3px;
  font-weight: 600;
  cursor: default;
  transition: outline 0.15s, transform 0.15s;
  min-width: 32px;
}
.od-matrix .od-cell:hover {
  outline: 2px solid var(--color-primary);
  transform: scale(1.05);
  z-index: 1;
  position: relative;
}
.od-matrix .od-cell--empty {
  color: var(--color-text-muted);
  font-weight: 400;
}
.od-matrix-note {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 8px;
  text-align: right;
}
```

### 10d. Update `loadAnalyticsHotspots()` in `app.js`:

```javascript
async function loadAnalyticsHotspots() {
  try {
    const res = await fetch('/api/analytics/hotspots' + getAnalyticsDateParams());
    if (!res.ok) return;
    const data = await res.json();
    renderHotspotList('hotspot-pickups', data.topPickups, '', 'pickups');
    renderHotspotList('hotspot-dropoffs', data.topDropoffs, 'darkgold', 'dropoffs');
    renderHotspotList('hotspot-routes', data.topRoutes, 'gold', 'trips');
    if (data.matrix) renderODMatrix('hotspot-matrix', data.matrix);
  } catch (e) { console.error('Analytics hotspots error:', e); }
}
```

---

## ADDITIONAL POLISH

### A. Column chart bar width
When there are only 5 bars (Mon-Fri), the bars are too fat (60% of slot width for 5 items = ~77px bars). Cap bar width at 50px max:
```javascript
const barW = Math.min(slotW * 0.6, 50);
```

### B. Stacked bar hover interaction
Currently the stacked bar segments don't dim when hovering a specific segment. Add this CSS interaction:
```css
.stacked-bar__track:hover .stacked-bar__seg:not(:hover) {
  opacity: 0.5;
}
.stacked-bar__seg {
  transition: opacity 0.15s, filter 0.15s;
  cursor: default;
}
.stacked-bar__seg:hover {
  filter: brightness(1.1);
}
```

### C. Apply card grid to Tardiness tab too
The tardiness tab should also use the `analytics-card-grid` layout instead of stacking `ro-section` blocks vertically. Wrap the donut + day-of-week in a 2-column card grid. Wrap the area chart and driver table in full-width cards.

### D. Card styling for all analytics sub-tabs
Apply the same card pattern to Milestones and Reports tabs for visual consistency. Each section gets wrapped in an `.analytics-card`.

---

## Testing Checklist

1. **Date filter visible on ALL sub-tabs** — switch between Dashboard, Hotspots, Tardiness etc and confirm From/To/Refresh is always visible
2. **Refresh button works** — set a date range, click Refresh, confirm data reloads on the active tab
3. **Line chart** — smooth curves, no visible dots by default, area gradient fades to transparent, crosshair + tooltip on hover
4. **Card grid layout** — Day of Week and Hour of Day appear side by side on desktop, stack on mobile
5. **Status Breakdown** — no "On the Way" or "5-min Grace Period" segments
6. **Milestones** — all 5 tier badges fit on one line within each card
7. **Semester Report** — Previous on left, Current on right. Delta shows e.g. "4.7" not "4.699999..."
8. **OD Matrix** — shows in Hotspots tab, cells colored by intensity, hoverable with tooltips
9. **Overall feel** — cards with borders, compact charts, no massive whitespace blocks. Should feel like a Creatio/Salesforce-style dashboard grid.
10. **Tardiness daily trend** — not showing 24 tardies in a single day (verify demo seed creates realistic data)
