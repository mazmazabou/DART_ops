# GridStack.js Migration Architecture

**Date:** 2026-03-01
**Scope:** Replace custom 4-column CSS grid + SortableJS with GridStack.js for the analytics widget dashboard system.

---

## Table of Contents

1. [Current System Audit](#1-current-system-audit)
2. [GridStack Widget Mapping](#2-gridstack-widget-mapping)
3. [Default Layouts Per Tab](#3-default-layouts-per-tab)
4. [Widget Constraints](#4-widget-constraints)
5. [SVG Chart Resize Strategy](#5-svg-chart-resize-strategy)
6. [Persistence Migration](#6-persistence-migration)
7. [CSS Changes](#7-css-changes)
8. [Files to Modify](#8-files-to-modify)

---

## 1. Current System Audit

### 1.1 Complete Widget Inventory

| Widget ID | Title | Chart Type | Default Size | Allowed Sizes | Container ID | Tab(s) |
|---|---|---|---|---|---|---|
| `kpi-grid` | Key Metrics | KPI cards (HTML grid) | `lg` | `lg` | `analytics-kpi-grid` | Dashboard |
| `ride-volume` | Ride Volume | Area/line chart (SVG) | `sm` | `xs, sm, md, lg` | `chart-ride-volume` | Dashboard |
| `ride-outcomes` | Ride Outcomes | Donut chart (SVG) | `sm` | `xs, sm, md, lg` | `chart-ride-outcomes` | Dashboard |
| `peak-hours` | Peak Hours | Heatmap table (HTML) | `lg` | `md, lg` | `chart-peak-hours` | Dashboard |
| `rides-by-dow` | Rides by Day of Week | Column chart (SVG) | `sm` | `xs, sm, md, lg` | `chart-dow` | Dashboard |
| `rides-by-hour` | Rides by Hour | Column chart (SVG) | `sm` | `xs, sm, md, lg` | `chart-hour` | Dashboard |
| `top-routes` | Top Routes | Sortable table (HTML) | `sm` | `sm, md, lg` | `chart-top-routes` | Dashboard |
| `driver-leaderboard` | Driver Leaderboard | Sortable table (HTML) | `sm` | `sm, md, lg` | `chart-driver-leaderboard` | Dashboard |
| `shift-coverage` | Shift Coverage | KPI row + table (HTML) | `lg` | `md, lg` | `chart-shift-coverage` | Dashboard |
| `fleet-utilization` | Fleet Utilization | Horizontal bar list (HTML) | `sm` | `xs, sm, md, lg` | `chart-fleet-util` | Dashboard |
| `rider-cohorts` | Rider Cohorts | Icon grid (HTML) | `sm` | `xs, sm, md, lg` | `chart-rider-cohorts` | Dashboard |
| `hotspot-pickups` | Top Pickup Locations | Ranked bar list (HTML) | `sm` | `xs, sm, md, lg` | `w-hotspot-pickups` / `ht-hotspot-pickups` | Dashboard, Hotspots |
| `hotspot-dropoffs` | Top Dropoff Locations | Ranked bar list (HTML) | `sm` | `xs, sm, md, lg` | `w-hotspot-dropoffs` / `ht-hotspot-dropoffs` | Dashboard, Hotspots |
| `route-demand-matrix` | Route Demand Matrix | Heatmap table (HTML) | `lg` | `md, lg` | `w-hotspot-matrix` / `ht-hotspot-matrix` | Dashboard, Hotspots |
| `hotspot-top-routes` | Top Routes (Hotspots) | Ranked bar list (HTML) | `md` | `sm, md, lg` | `ht-top-routes` | Hotspots |
| `driver-milestones` | Driver Milestones | Card list + progress bars (HTML) | `sm` | `xs, sm, md, lg` | `w-driver-milestones` / `ms-driver-milestones` | Dashboard, Milestones |
| `rider-milestones` | Rider Milestones | Card list + progress bars (HTML) | `sm` | `xs, sm, md, lg` | `w-rider-milestones` / `ms-rider-milestones` | Dashboard, Milestones |
| `attendance-kpis` | Attendance KPIs | KPI cards (HTML grid) | `lg` | `lg` | `att-kpis` | Attendance |
| `attendance-donut` | Attendance Distribution | Donut chart (SVG) | `sm` | `xs, sm, md` | `att-donut` | Attendance |
| `tardiness-by-dow` | Tardiness by Day | Column chart (SVG) | `sm` | `xs, sm, md` | `att-dow` | Attendance |
| `tardiness-trend` | Tardiness Trend | Area/line chart (SVG) | `sm` | `sm, lg` | `att-trend` | Attendance |
| `punctuality-table` | Punctuality by Driver | Table (HTML) | `lg` | `md, lg` | `att-punctuality` | Attendance |

**22 widgets total across 9 categories, 4 tabs.**

### 1.2 Current Size System

| Size | CSS Class | Grid Span (4-col) | Max/Min Height | Behavior |
|---|---|---|---|---|
| `xs` | `widget-card--xs` | `span 1` (25%) | `max-height: 336px` | Hides donut legends, compact fonts, `overflow-y: auto` body |
| `sm` | `widget-card--sm` | `span 2` (50%) | `max-height: 336px` | Hides donut legends, compact fonts, `overflow-y: auto` body |
| `md` | `widget-card--md` | `span 3` (75%) | `min-height: 300px` | Full chrome, no height cap |
| `lg` | `widget-card--lg` | `span 4` (100%) | None | Full width, content-dictated height |

Responsive breakpoints:
- At 1024px: collapses to 2-column grid (`xs`=span 1, `sm`=span 1, `md`=span 2, `lg`=full)
- At 768px: collapses to 1-column grid (all sizes span 1)
- Print: 2-column grid

### 1.3 Layout Persistence

**localStorage key format:** `rideops_widget_layout_{storagePrefix}_{userId}`

Where `storagePrefix` is one of: `dashboard`, `hotspots`, `milestones`, `attendance`.

**Saved data shape:**
```json
{
  "version": 2,
  "widgets": [
    { "id": "kpi-grid", "size": "lg" },
    { "id": "ride-volume", "size": "sm" }
  ]
}
```

The `version` field (`WIDGET_LAYOUT_VERSION = 2`) triggers a full reset when the version changes. Widget order in the array determines visual order in the grid (top-to-bottom, left-to-right flow).

### 1.4 Edit Mode

**Functions involved:**
- `toggleWidgetEditMode(tabId)` -- toggles `inst.editMode` boolean, adds/removes `widget-grid--editing` class on the grid container, shows/hides toolbar buttons, enables/disables SortableJS
- The `widget-grid--editing` CSS class reveals drag handles (`.widget-card__drag-handle`) and action buttons (`.widget-card__actions` including size picker and remove button)
- Without edit mode, drag handles and action buttons are `display: none`

**Toolbar UI per tab:**
- "Customize" button (e.g., `#widget-customize-btn`) -- hidden when editing, shown otherwise
- Toolbar div (e.g., `#widget-toolbar`) -- hidden normally, shown when editing, contains:
  - "Done" button -- exits edit mode
  - "Add Widget" button -- opens widget library drawer
  - "Reset" button -- resets layout to defaults (with confirmation modal)

**Toolbar element IDs per tab:**

| Tab | Customize | Toolbar | Done | Add | Reset |
|---|---|---|---|---|---|
| Dashboard | `widget-customize-btn` | `widget-toolbar` | `widget-done-btn` | `widget-add-btn` | `widget-reset-btn` |
| Hotspots | `ht-customize-btn` | `ht-toolbar` | `ht-done-btn` | `ht-add-btn` | `ht-reset-btn` |
| Milestones | `ms-customize-btn` | `ms-toolbar` | `ms-done-btn` | `ms-add-btn` | `ms-reset-btn` |
| Attendance | `att-customize-btn` | `att-toolbar` | `att-done-btn` | `att-add-btn` | `att-reset-btn` |

### 1.5 Widget Library (Add Widget Picker)

A single shared right-side drawer (`#widget-library-drawer`) is filtered per active tab. The flow:

1. User clicks "Add Widget" in the toolbar
2. `openWidgetLibrary(tabId)` sets `_activeWidgetTab`, opens drawer + backdrop
3. `renderWidgetLibrary(tabId)` filters `WIDGET_REGISTRY` to show only widgets that are (a) not already on the tab and (b) in the tab's `allowedWidgets` list
4. Widgets are grouped by `WIDGET_CATEGORIES`
5. Clicking "+" calls `addWidget(tabId, widgetId)` which pushes to layout, re-renders grid, re-renders library, and triggers tab reload

### 1.6 Widget Loader Registration

All widget loaders are registered in `app.js` (DOMContentLoaded, line ~5735) via:
```js
registerWidgetLoader('widget-id', async function(containerId) { ... });
```

The global `_widgetLoaders` map stores these. They are called in two places:
1. **Tab load** -- `_triggerTabReload(tabId)` calls the per-tab load function (e.g., `loadDashboardWidgets()`), which calls `loadVisibleWidgets(tabId)` for skeleton placeholders, then fetches data and renders
2. **Resize** -- `setWidgetSize(tabId, widgetId, newSize)` and `resizeWidget(tabId, widgetId)` call `_widgetLoaders[widgetId](containerId)` to re-render chart content at the new size

The `containerId` parameter is resolved per-widget via `containerOverrides[widgetId] || def.containerId`.

### 1.7 Container ID Prefix System

Widgets that appear on multiple tabs use per-tab container ID overrides:

| Widget ID | Dashboard Container | Hotspots Container | Milestones Container |
|---|---|---|---|
| `hotspot-pickups` | `w-hotspot-pickups` | `ht-hotspot-pickups` | -- |
| `hotspot-dropoffs` | `w-hotspot-dropoffs` | `ht-hotspot-dropoffs` | -- |
| `route-demand-matrix` | `w-hotspot-matrix` | `ht-hotspot-matrix` | -- |
| `driver-milestones` | `w-driver-milestones` | -- | `ms-driver-milestones` |
| `rider-milestones` | `w-rider-milestones` | -- | `ms-rider-milestones` |

All other widgets use their `containerId` directly. The `containerOverrides` config on `createWidgetInstance()` handles the mapping.

### 1.8 Current Chart Rendering Functions

| Render Function | Used By | Output Type | Size-Aware? |
|---|---|---|---|
| `renderColumnChart()` | rides-by-dow, rides-by-hour, tardiness-by-dow | SVG with `viewBox`, `col-chart-wrap` | Yes -- reads `getWidgetSize()`, adjusts viewBox W/H and label density |
| `renderLineChart()` | ride-volume, tardiness-trend | SVG with `viewBox`, `area-chart-wrap` | Yes -- reads `getWidgetSize()`, adjusts viewBox W/H and label density |
| `renderDonutChart()` | ride-outcomes | SVG donut with `donut-wrap` | Yes -- reads `getWidgetSize()`, adjusts viewBox dimensions and legend visibility |
| `renderAttendanceDonut()` | attendance-donut | SVG donut with `donut-wrap` | No -- fixed `viewBox="0 0 160 160"` |
| `renderStackedBar()` | (internal helper) | HTML flex bar | No |
| `renderHotspotList()` | hotspot-pickups, hotspot-dropoffs, hotspot-top-routes | HTML bar list | No |
| `renderODMatrix()` | route-demand-matrix | HTML heatmap table | No |
| `renderPeakHoursHeatmap()` | peak-hours | HTML heatmap table | No |
| `renderTopRoutesTable()` | top-routes | HTML sortable table | No |
| `renderDriverLeaderboard()` | driver-leaderboard | HTML sortable table | No |
| `renderShiftCoverageChart()` | shift-coverage | HTML KPI row + table | No |
| `renderFleetUtilChart()` | fleet-utilization | HTML horizontal bars | No |
| `renderRiderCohorts()` | rider-cohorts | HTML 3x2 icon grid | No |
| `renderKPIGrid()` | kpi-grid | HTML KPI cards | No |
| `renderAttendanceKPIs()` | attendance-kpis | HTML KPI cards | No |
| `renderMilestoneList()` | driver-milestones, rider-milestones | HTML card list + progress bars | No |
| `renderPunctualityTable()` | punctuality-table | HTML table | No |
| `renderTardinessDOW()` | tardiness-by-dow | Wrapper that calls `renderColumnChart()` | Inherited from renderColumnChart |
| `renderTardinessTrend()` | tardiness-trend | Wrapper that calls `renderLineChart()` | Inherited from renderLineChart |

**Key observation:** `getWidgetSize(containerId)` reads the `data-size` attribute from the closest `.widget-card` ancestor. GridStack will replace this mechanism -- the widget card's `data-size` attribute will no longer exist. Instead, we derive the "logical size" from GridStack's `w` (width in grid units).

---

## 2. GridStack Widget Mapping

### 2.1 Grid Configuration

I recommend a **12-column GridStack grid** with `cellHeight: 80` (80px per row unit). This gives fine-grained placement control while keeping the math simple.

**Why 12 columns:**
- Industry standard (Bootstrap, Material, GridStack default)
- Clean divisors: 1, 2, 3, 4, 6, 12 -- all produce integer column spans
- The current 4-column grid maps cleanly: `xs`=3, `sm`=6, `md`=9, `lg`=12

**Why `cellHeight: 80`:**
- A KPI bar at `h=1` (80px) is tight but workable; `h=2` (160px) feels more generous
- An `sm` chart at `h=4` = 320px, close to the current 336px max-height
- An `lg` table at `h=5` = 400px, comfortable for shift coverage and punctuality data
- An `xs` widget at `h=3` = 240px, close to the current 280px compact target

### 2.2 Size Mapping Table

| Old Size | Old Span (of 4) | GridStack `w` (of 12) | GridStack `h` | Pixel Width (approx) | Pixel Height |
|---|---|---|---|---|---|
| `xs` | 1 (25%) | 3 | 3 | ~25% | 240px |
| `sm` | 2 (50%) | 6 | 4 | ~50% | 320px |
| `md` | 3 (75%) | 9 | 4 | ~75% | 320px |
| `lg` | 4 (100%) | 12 | varies | 100% | varies |

**`lg` height varies by widget type:**
- KPI bars (`kpi-grid`, `attendance-kpis`): `h=2` (160px) -- content is short
- Heatmaps (`peak-hours`, `route-demand-matrix`): `h=5` (400px) -- need vertical space for rows
- Tables (`shift-coverage`, `punctuality-table`): `h=5` (400px) -- need space for rows
- Trend charts at lg (`tardiness-trend`): `h=4` (320px)

### 2.3 Logical Size Derivation

Since `data-size` attributes will no longer drive layout, we need a function to derive the logical size from GridStack width:

```
GridStack w  ->  Logical size
w <= 3       ->  'xs'
w <= 6       ->  'sm'
w <= 9       ->  'md'
w >= 10      ->  'lg'
```

This mapping replaces `getWidgetSize()`. The function will read `gridStackNode.w` (or `el.gridstackNode.w`) instead of traversing DOM for `data-size`.

### 2.4 Responsive Breakpoints

GridStack supports responsive column scaling via `columnOpts.breakpoints`:

```
Viewport >= 1200px  ->  12 columns (full desktop)
Viewport >= 996px   ->  8 columns  (small desktop / large tablet)
Viewport >= 768px   ->  4 columns  (tablet)
Viewport < 768px    ->  1 column   (mobile, should not happen for office view)
```

This replaces the current `@media` queries on `.widget-grid`. GridStack handles the column collapse and widget reflow automatically with `layout: 'list'` mode, which stacks widgets vertically at lower column counts.

---

## 3. Default Layouts Per Tab (GridStack Format)

All layouts use `{id, x, y, w, h}` format. The `x` and `y` values pack widgets top-to-bottom, left-to-right with no gaps.

### 3.1 Dashboard Tab

12-column grid. Widgets flow left-to-right, wrapping to next row.

```json
[
  { "id": "kpi-grid",            "x": 0,  "y": 0,  "w": 12, "h": 2 },
  { "id": "ride-volume",         "x": 0,  "y": 2,  "w": 6,  "h": 4 },
  { "id": "ride-outcomes",       "x": 6,  "y": 2,  "w": 6,  "h": 4 },
  { "id": "peak-hours",          "x": 0,  "y": 6,  "w": 12, "h": 5 },
  { "id": "rides-by-dow",        "x": 0,  "y": 11, "w": 6,  "h": 4 },
  { "id": "rides-by-hour",       "x": 6,  "y": 11, "w": 6,  "h": 4 },
  { "id": "top-routes",          "x": 0,  "y": 15, "w": 6,  "h": 4 },
  { "id": "driver-leaderboard",  "x": 6,  "y": 15, "w": 6,  "h": 4 },
  { "id": "shift-coverage",      "x": 0,  "y": 19, "w": 12, "h": 5 },
  { "id": "fleet-utilization",   "x": 0,  "y": 24, "w": 6,  "h": 4 },
  { "id": "rider-cohorts",       "x": 6,  "y": 24, "w": 6,  "h": 4 }
]
```

### 3.2 Hotspots Tab

```json
[
  { "id": "hotspot-pickups",      "x": 0,  "y": 0,  "w": 6,  "h": 4 },
  { "id": "hotspot-dropoffs",     "x": 6,  "y": 0,  "w": 6,  "h": 4 },
  { "id": "hotspot-top-routes",   "x": 0,  "y": 4,  "w": 9,  "h": 4 },
  { "id": "route-demand-matrix",  "x": 0,  "y": 8,  "w": 12, "h": 5 }
]
```

### 3.3 Milestones Tab

```json
[
  { "id": "driver-milestones",  "x": 0,  "y": 0,  "w": 6,  "h": 4 },
  { "id": "rider-milestones",   "x": 6,  "y": 0,  "w": 6,  "h": 4 }
]
```

### 3.4 Attendance Tab

```json
[
  { "id": "attendance-kpis",    "x": 0,  "y": 0,  "w": 12, "h": 2 },
  { "id": "attendance-donut",   "x": 0,  "y": 2,  "w": 6,  "h": 4 },
  { "id": "tardiness-by-dow",   "x": 6,  "y": 2,  "w": 6,  "h": 4 },
  { "id": "tardiness-trend",    "x": 0,  "y": 6,  "w": 6,  "h": 4 },
  { "id": "punctuality-table",  "x": 0,  "y": 10, "w": 12, "h": 5 }
]
```

---

## 4. Widget Constraints

GridStack supports per-widget `minW`, `maxW`, `minH`, `maxH` constraints. These prevent users from resizing widgets to sizes where content becomes unreadable.

### 4.1 Constraint Definitions

These constraints should be stored in `WIDGET_REGISTRY` alongside existing metadata.

| Widget ID | Type | minW | maxW | minH | maxH | noResize | Notes |
|---|---|---|---|---|---|---|---|
| `kpi-grid` | KPI cards | 12 | 12 | 2 | 3 | **true** | Always full-width. Height-locked to fit KPI row. |
| `ride-volume` | Area chart (SVG) | 3 | 12 | 3 | 6 | false | SVG scales; xs hides value labels. |
| `ride-outcomes` | Donut (SVG) | 3 | 12 | 3 | 6 | false | xs/sm hide legend via CSS. |
| `peak-hours` | Heatmap table | 6 | 12 | 4 | 7 | false | Needs width for 5 day-columns + hour labels. |
| `rides-by-dow` | Column chart (SVG) | 3 | 12 | 3 | 6 | false | SVG scales; xs compresses labels. |
| `rides-by-hour` | Column chart (SVG) | 3 | 12 | 3 | 6 | false | SVG scales; xs compresses labels. |
| `top-routes` | Table | 6 | 12 | 3 | 7 | false | Needs width for route names + columns. |
| `driver-leaderboard` | Table | 6 | 12 | 3 | 7 | false | Needs width for 4 columns. |
| `shift-coverage` | KPI + table | 6 | 12 | 4 | 8 | false | KPI row + multi-row table. |
| `fleet-utilization` | Bar list | 3 | 12 | 3 | 6 | false | Horizontal bars scale well. |
| `rider-cohorts` | Icon grid | 3 | 12 | 3 | 5 | false | 3x2 grid collapses to 2x3 at xs. |
| `hotspot-pickups` | Bar list | 3 | 12 | 3 | 6 | false | Ranked bars scale well. |
| `hotspot-dropoffs` | Bar list | 3 | 12 | 3 | 6 | false | Ranked bars scale well. |
| `route-demand-matrix` | Heatmap table | 6 | 12 | 4 | 7 | false | Needs width for 8 destination columns. |
| `hotspot-top-routes` | Bar list | 6 | 12 | 3 | 6 | false | Route names need space. |
| `driver-milestones` | Card list | 3 | 12 | 3 | 8 | false | Cards stack vertically. |
| `rider-milestones` | Card list | 3 | 12 | 3 | 8 | false | Cards stack vertically. |
| `attendance-kpis` | KPI cards | 12 | 12 | 2 | 3 | **true** | Always full-width, height-locked. |
| `attendance-donut` | Donut (SVG) | 3 | 9 | 3 | 5 | false | maxW=9 since `allowedSizes` capped at `md`. |
| `tardiness-by-dow` | Column chart (SVG) | 3 | 9 | 3 | 5 | false | maxW=9 since `allowedSizes` capped at `md`. |
| `tardiness-trend` | Area chart (SVG) | 6 | 12 | 3 | 6 | false | Only `sm` and `lg` were allowed. minW=6 enforces sm minimum. |
| `punctuality-table` | Table | 6 | 12 | 4 | 8 | false | Needs width for 7 columns. |

### 4.2 Constraint Rationale by Chart Type

**KPI bars** (`kpi-grid`, `attendance-kpis`): Fixed at full-width (`w=12`) because KPI cards are laid out horizontally and need the full row. `noResize: true` because there is no meaningful resize behavior -- 5-6 KPI cards always need the full width.

**SVG charts** (`ride-volume`, `ride-outcomes`, `rides-by-dow`, `rides-by-hour`, `attendance-donut`, `tardiness-by-dow`, `tardiness-trend`): `minW=3` allows compact display where SVG viewBox scaling handles the rendering. `minH=3` (240px) ensures the chart is not too vertically squished. `maxH=6` (480px) prevents excessive whitespace.

**Tables** (`top-routes`, `driver-leaderboard`, `shift-coverage`, `punctuality-table`): `minW=6` because table columns with text labels need at least half the viewport width to be readable. `maxH=7-8` allows room for scrollable content.

**Heatmaps** (`peak-hours`, `route-demand-matrix`): `minW=6` because the 5-column (days) x N-row (hours or origins) layout collapses to unreadable at narrow widths.

**Bar lists** (`hotspot-pickups`, `hotspot-dropoffs`, `fleet-utilization`): `minW=3` because horizontal bars with truncated labels still work at narrow widths.

---

## 5. SVG Chart Resize Strategy

### 5.1 Core Principle: Threshold-Based Re-Rendering

SVG charts use `viewBox` + `preserveAspectRatio="xMidYMid meet"`, which means the browser handles smooth scaling automatically within a size range. We only need to call the widget's loader function when crossing a **structural threshold** that changes the chart's internal dimensions or hides/shows elements.

### 5.2 Structural Thresholds

The threshold is based on the logical size derived from GridStack `w`:

| Threshold Crossing | What Changes | Action |
|---|---|---|
| `w` crosses 3 (xs boundary) | Column chart viewBox changes from 300x260 to 700x180. Line chart viewBox changes from 300x280 to 700x260. Label density changes. Donut legend visibility changes. | **Re-render** via widget loader |
| `w` crosses 6 (sm/md boundary) | Donut chart viewBox may change. Legend could show/hide. | **Re-render** via widget loader |
| `h` changes at any width | SVG viewBox handles vertical scaling. Chart is already flex-fill. | **No re-render needed** -- CSS handles it |

### 5.3 `resizestop` Handler Design

```
On GridStack 'resizestop' event(event, el):
  1. Get widget ID from el.gridstackNode.id
  2. Get new w from el.gridstackNode.w
  3. Compute new logical size: getLogicalSize(w)
  4. Compare to previous logical size (stored on el or in layout)
  5. IF logical size changed:
     a. Update CSS class on widget card for size-specific styling
     b. Call _widgetLoaders[widgetId](containerId) to re-render
  6. Save layout to localStorage
```

Non-SVG widgets (tables, KPI bars, bar lists) use pure HTML/CSS that reflows naturally on resize. They do **not** need re-rendering on resize -- the browser handles column wrapping and text truncation.

### 5.4 `getWidgetSize()` Replacement

The current `getWidgetSize(containerId)` function traverses the DOM to find `.widget-card[data-size]`. This must be replaced with a function that reads from the GridStack node:

```
function getWidgetSize(containerId):
  1. Find the .grid-stack-item ancestor of the container
  2. Read el.gridstackNode.w
  3. Return logical size: w<=3 -> 'xs', w<=6 -> 'sm', w<=9 -> 'md', else 'lg'
```

This function is called inside `renderColumnChart()`, `renderLineChart()`, and `renderDonutChart()` to decide viewBox dimensions and label density. The implementation must remain synchronous since it is called mid-render.

### 5.5 Container ID Mapping for Multi-Tab

The container override system remains unchanged. Each `createWidgetInstance()` call specifies `containerOverrides`, and the widget card HTML is built with the overridden container ID.

The difference is that GridStack uses `grid.addWidget({id, x, y, w, h, content})` where `content` is the widget card's inner HTML. The container ID is embedded in the `content` string, same as today's `buildWidgetCardHTML()`.

### 5.6 The `change` Event for Auto-Save

GridStack fires `change` whenever widgets are moved or resized. We hook this to save the layout:

```
grid.on('change', function(event, items) {
  var layout = grid.save(false);  // returns [{id, x, y, w, h}, ...]
  saveWidgetLayout(storagePrefix, userId, layout);
});
```

This replaces the SortableJS `onEnd` handler.

---

## 6. Persistence Migration

### 6.1 Detecting Old Layout Format

The current saved format:
```json
{ "version": 2, "widgets": [{ "id": "...", "size": "sm" }] }
```

The new GridStack format:
```json
{ "version": 3, "widgets": [{ "id": "...", "x": 0, "y": 0, "w": 6, "h": 4 }] }
```

Detection strategy: bump `WIDGET_LAYOUT_VERSION` from `2` to `3`. The existing `loadWidgetLayout()` function already checks `saved.version !== WIDGET_LAYOUT_VERSION` and returns `null` on mismatch, which triggers fallback to the default layout. This means **all users get their layouts reset to defaults on first load after migration**, which is the correct behavior since old `size`-only layouts cannot be meaningfully converted to `{x, y, w, h}` positions.

### 6.2 New Layout Data Shape

```json
{
  "version": 3,
  "widgets": [
    { "id": "kpi-grid", "x": 0, "y": 0, "w": 12, "h": 2 },
    { "id": "ride-volume", "x": 0, "y": 2, "w": 6, "h": 4 }
  ]
}
```

### 6.3 Save Flow

```
function saveWidgetLayout(storagePrefix, userId, gridStackItems):
  var widgets = gridStackItems.map(item => ({
    id: item.id,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h
  }));
  localStorage.setItem(key, JSON.stringify({
    version: WIDGET_LAYOUT_VERSION,
    widgets: widgets
  }));
```

### 6.4 Load Flow

```
function loadWidgetLayout(storagePrefix, userId):
  var raw = localStorage.getItem(key);
  if (!raw) return null;
  var saved = JSON.parse(raw);
  if (saved.version !== WIDGET_LAYOUT_VERSION) return null;  // triggers default layout
  // Validate each widget still exists in WIDGET_REGISTRY
  // Apply min/max constraints from registry
  return saved.widgets;
```

### 6.5 Version Bump

- Current: `WIDGET_LAYOUT_VERSION = 2`
- New: `WIDGET_LAYOUT_VERSION = 3`

No migration code needed. Old layouts simply reset. This is acceptable because:
1. This is an internal operations tool, not a consumer product
2. The default layouts are well-designed
3. The effort to map `size`-only layouts to `{x,y,w,h}` positions would produce suboptimal results anyway

---

## 7. CSS Changes

### 7.1 Add: GridStack CDN Stylesheet

In `index.html`, add before `rideops-theme.css`:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@12/dist/gridstack.min.css">
```

### 7.2 Add: GridStack Override Styles (in rideops-theme.css)

New CSS to override GridStack defaults and integrate with RideOps theming:

```css
/* ── GridStack Integration ── */

/* Make grid-stack containers fill the tab panel */
.grid-stack {
  padding: 0 24px 24px;
}

/* Override GridStack's widget styling to match RideOps card style */
.grid-stack-item-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  inset: 0;  /* GridStack default, keep */
}

.grid-stack-item-content:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}

/* Widget header (reuse existing widget-card__header styles) */
/* ... existing .widget-card__header, __title, __body styles apply within grid-stack-item-content */

/* Edit mode: dashed border on grid items */
.grid-stack.gs-editing > .grid-stack-item > .grid-stack-item-content {
  border: 2px dashed var(--color-primary-light);
}
.grid-stack.gs-editing > .grid-stack-item > .grid-stack-item-content:hover {
  border-color: var(--color-primary);
}

/* GridStack placeholder styling (the blue ghost during drag) */
.grid-stack > .grid-stack-placeholder > .placeholder-content {
  background: var(--color-primary-subtle);
  border: 2px dashed var(--color-primary);
  border-radius: var(--radius-md);
  opacity: 0.5;
}

/* Resize handle visibility -- only in edit mode */
.grid-stack-item > .ui-resizable-handle {
  display: none;
}
.grid-stack.gs-editing > .grid-stack-item > .ui-resizable-handle {
  display: block;
}

/* Drag handle -- only in edit mode */
.widget-card__drag-handle {
  display: none;
  cursor: grab;
  color: inherit;
  opacity: 0.6;
  font-size: 16px;
  padding: 0 2px;
}
.gs-editing .widget-card__drag-handle {
  display: flex;
  opacity: 0.85;
  font-size: 18px;
}

/* Action buttons -- only in edit mode */
.widget-card__actions {
  display: none;
  align-items: center;
  gap: 4px;
}
.gs-editing .widget-card__actions {
  display: flex;
}

/* Chart scaling inside GridStack items (replace widget-card size selectors) */
.grid-stack-item-content .widget-card__body:has(.col-chart-wrap),
.grid-stack-item-content .widget-card__body:has(.area-chart-wrap),
.grid-stack-item-content .widget-card__body:has(.donut-wrap) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Donut legend hiding for narrow widgets -- via data-logical-size attribute */
.grid-stack-item[data-logical-size="xs"] .donut-legend,
.grid-stack-item[data-logical-size="sm"] .donut-legend {
  display: none;
}

/* GridStack empty grid state */
.grid-stack:empty::after {
  content: 'No widgets on this tab. Click "Customize" to add widgets.';
  display: block;
  text-align: center;
  padding: 64px 24px;
  color: var(--color-text-muted);
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  grid-column: 1 / -1;
}
```

**Responsive overrides for GridStack are NOT needed** -- GridStack handles responsive column scaling via its `columnOpts.breakpoints` configuration (see Section 2.4). The `@media` queries in CSS are replaced by GridStack's responsive engine.

### 7.3 Remove: Old Grid and SortableJS Styles

The following CSS blocks should be **removed** from `rideops-theme.css`:

**Lines ~1269-1275 (old widget grid):**
```css
/* REMOVE: .widget-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; ... } */
```

**Lines ~1292-1327 (old size classes):**
```css
/* REMOVE: .widget-card--xs { grid-column: span 1; max-height: 336px; }
   REMOVE: .widget-card--sm { grid-column: span 2; max-height: 336px; }
   REMOVE: .widget-card--md { grid-column: span 3; min-height: 300px; }
   REMOVE: .widget-card--lg { grid-column: 1 / -1; } */
```

**Lines ~1382-1397 (old edit mode toggle via `widget-grid--editing`):**
```css
/* REMOVE: .widget-grid--editing .widget-card__drag-handle, ... */
/* Replaced by .gs-editing equivalents */
```

**Lines ~1428-1434 (SortableJS ghost/drag):**
```css
/* REMOVE: .sortable-ghost { opacity: 0.4; ... }
   REMOVE: .sortable-drag { box-shadow: var(--shadow-lg); } */
```

**Lines ~1487-1509 (old responsive breakpoints and print for widget-grid):**
```css
/* REMOVE: @media (max-width: 1024px) { .widget-grid { grid-template-columns: repeat(2, 1fr); } ... }
   REMOVE: @media (max-width: 768px) { .widget-grid { grid-template-columns: 1fr; } ... }
   REMOVE: @media print { .widget-grid { ... } } */
```

### 7.4 Keep: Existing Styles

The following CSS is retained and continues to work inside GridStack items:

- `.widget-card__header` base styles (background, padding, border-radius top) -- lines ~1329-1340
- `.widget-card__title` styles -- lines ~1341-1348
- `.widget-card__body` base styles -- line ~1349
- `.widget-action` styles -- lines ~1367-1379
- `.widget-card__size-badge` -- line ~1400-1402 (hidden, can be removed if desired)
- `.widget-size-picker` and `.widget-size-btn` -- lines ~1405-1408 (kept but repurposed; see below)
- `.widget-card--resizing` animation -- lines ~1411-1417 (may still be useful for visual feedback)
- `.widget-toolbar-bar` -- lines ~1256-1266
- Widget library styles -- lines ~1437-1485
- All chart-inside-widget styles -- lines ~1084-1159 (with selector adjustments for `.grid-stack-item-content` instead of `.widget-card`)

**Important selector update:** CSS selectors that currently target `.widget-card` or `.widget-card--{size}` must be updated to target `.grid-stack-item-content` or use the new `[data-logical-size]` attribute on `.grid-stack-item` elements. The chart scaling rules (lines ~1084-1159) reference `.widget-card` and `.widget-card--xs`, `.widget-card--sm`, etc. These need to be rewritten to use `.grid-stack-item[data-logical-size="xs"]` selectors.

### 7.5 Print Styles

Add new print media query for GridStack:
```css
@media print {
  .widget-toolbar-bar { display: none !important; }
  .grid-stack { min-height: auto !important; }
  .grid-stack-item { position: static !important; width: 50% !important; display: inline-block !important; }
  .grid-stack-item-content { box-shadow: none; border: 1px solid #ddd; }
}
```

---

## 8. Files to Modify

### 8.1 `public/index.html`

**Changes:**
1. **Replace SortableJS CDN** (line 550) with GridStack CDN:
   - Remove: `<script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/Sortable.min.js"></script>`
   - Add: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/gridstack@12/dist/gridstack.min.css">` (in `<head>`)
   - Add: `<script src="https://cdn.jsdelivr.net/npm/gridstack@12/dist/gridstack-all.js"></script>` (before `widget-system.js`)

2. **Replace widget grid containers** with GridStack-compatible markup:
   - `<div class="widget-grid" id="widget-grid"></div>` becomes `<div class="grid-stack" id="widget-grid"></div>`
   - Same for `#ht-widget-grid`, `#ms-widget-grid`, `#att-widget-grid`
   - Remove the `widget-grid` class from these containers

### 8.2 `public/js/widget-system.js`

**This is the most heavily modified file.** Essentially a rewrite of the runtime engine.

**Remove:**
- `WIDGET_SIZE_LABELS`, `WIDGET_SIZE_SHORT_LABELS` globals (size labels become less relevant with free-form resize)
- `buildSizePickerHTML()` function (GridStack native resize replaces discrete size buttons)
- `buildWidgetCardHTML()` function (replaced by GridStack-aware card builder)
- `initWidgetSortable()` function (SortableJS integration)
- `resizeWidget()` function (cycle-through-sizes behavior; GridStack handles resize natively)
- `setWidgetSize()` function (discrete size setting; GridStack handles this)
- All SortableJS references

**Replace with:**
- `initGridStack(tabId)` -- creates `GridStack.init()` with per-tab options, hooks events
- `buildGridStackItemContent(widgetId, containerId)` -- builds the inner HTML for a GridStack item (header with drag handle, actions, title; body with container div)
- `getLogicalSize(gridStackW)` -- maps `w` to `xs/sm/md/lg`
- Updated `renderWidgetGrid(tabId)` -- uses `grid.load(items)` instead of innerHTML
- Updated `addWidget(tabId, widgetId)` -- uses `grid.addWidget({...})`
- Updated `removeWidget(tabId, widgetId)` -- uses `grid.removeWidget(el)`
- Updated `toggleWidgetEditMode(tabId)` -- uses `grid.setStatic(!editMode)` or `grid.enableMove()/enableResize()`
- Updated `saveWidgetLayout()` -- uses `grid.save(false)` output
- Updated `loadWidgetLayout()` -- validates version 3 format with `{x,y,w,h}`
- Updated `resetWidgetLayout(tabId)` -- uses `grid.load(defaultLayout)`
- `resizestop` handler -- checks logical size threshold crossing, calls widget loader if needed
- `change` handler -- auto-saves layout on any move/resize

**`WIDGET_LAYOUT_VERSION`** bumped from `2` to `3`.

**Key architectural decision:** The `createWidgetInstance()` factory pattern is retained. Each tab still gets its own instance with its own GridStack grid, storage prefix, allowed widgets, container overrides, and toolbar IDs. The only difference is that `inst.sortable` (SortableJS instance) is replaced by `inst.grid` (GridStack instance).

### 8.3 `public/js/widget-registry.js`

**Changes:**
1. **Add GridStack constraints** to each widget definition:
   ```js
   'ride-volume': {
     // ... existing fields ...
     minW: 3, maxW: 12, minH: 3, maxH: 6,
     noResize: false
   }
   ```

2. **Convert default layouts** from `{ id, size }` to `{ id, x, y, w, h }`:
   - `DEFAULT_WIDGET_LAYOUT` -- see Section 3.1
   - `DEFAULT_HOTSPOTS_LAYOUT` -- see Section 3.2
   - `DEFAULT_MILESTONES_LAYOUT` -- see Section 3.3
   - `DEFAULT_ATTENDANCE_LAYOUT` -- see Section 3.4

3. **Remove `allowedSizes` and `defaultSize` fields** from all widget definitions (replaced by GridStack constraints). Alternatively, keep them for backward compatibility during transition but mark as deprecated.

### 8.4 `public/app.js`

**Changes:**
1. **Update `getWidgetSize(containerId)`** (line ~3195) to read from GridStack node instead of `data-size` attribute:
   ```js
   function getWidgetSize(containerId) {
     var el = document.getElementById(containerId);
     if (!el) return null;
     var gsItem = el.closest('.grid-stack-item');
     if (!gsItem || !gsItem.gridstackNode) return null;
     var w = gsItem.gridstackNode.w;
     if (w <= 3) return 'xs';
     if (w <= 6) return 'sm';
     if (w <= 9) return 'md';
     return 'lg';
   }
   ```

2. **Update `createWidgetInstance()` calls** (lines ~5815-5867) -- no change to the calls themselves, but the config objects may need to reference GridStack-specific options. The `containerOverrides` pattern remains identical.

3. **Widget loader functions remain unchanged.** The loader contract (`function(containerId)`) is stable. GridStack does not affect how data is fetched or rendered into a container div.

4. **Tab load functions** (`loadDashboardWidgets`, `loadHotspotsWidgets`, etc.) remain unchanged -- they call `loadVisibleWidgets(tabId)` for skeletons, then invoke data fetch + render.

### 8.5 `public/css/rideops-theme.css`

**Changes:**
- Remove old `.widget-grid` grid layout (see Section 7.3)
- Remove old `.widget-card--{size}` grid-column rules (see Section 7.3)
- Remove SortableJS `.sortable-ghost` / `.sortable-drag` classes (see Section 7.3)
- Remove old responsive `@media` rules for `.widget-grid` (see Section 7.3)
- Add GridStack integration styles (see Section 7.2)
- Update chart-in-widget selectors from `.widget-card` to `.grid-stack-item-content` and from `.widget-card--{size}` to `[data-logical-size]` (see Section 7.4)
- Add print styles for GridStack (see Section 7.5)

### 8.6 `CLAUDE.md`

**Changes:**
- Update "CDN Dependencies" section: replace SortableJS entry with GridStack entries
- Update "Analytics Architecture" section:
  - Replace "SortableJS CDN" mentions with GridStack
  - Update "4-Size System" description to describe 12-column GridStack grid with logical sizes
  - Update layout persistence description
  - Update `WIDGET_LAYOUT_VERSION` reference from 2 to 3
- Update "What NOT to Do" if any SortableJS-specific warnings exist

### 8.7 Memory Files

**Changes:**
- Update `/Users/mazenabouelela/Documents/Projects/RideOps/.claude/agent-memory/architect/MEMORY.md` to reflect GridStack migration
- Update any references to SortableJS, 4-column grid, or `WIDGET_LAYOUT_VERSION = 2`

### 8.8 Files NOT Modified

The following files are explicitly **not touched** by this migration:

- `server.js` -- no backend changes; analytics API endpoints are unchanged
- `public/driver.html` -- no widget system
- `public/rider.html` -- no widget system
- `public/login.html`, `public/signup.html`, `public/demo.html` -- no widget system
- `public/utils.js`, `public/js/rideops-utils.js` -- no widget dependencies
- `public/campus-themes.js` -- chart palette functions unchanged
- All tenant config files -- unaffected
- Test files -- E2E tests do not test widget drag/resize behavior

---

## Appendix A: GridStack Initialization Reference

For each tab, the GridStack initialization will look approximately like this:

```
GridStack.init({
  column: 12,
  cellHeight: 80,
  margin: 8,
  animate: true,
  float: false,
  staticGrid: true,           // Start in static (non-edit) mode
  disableResize: true,         // Start with resize disabled
  draggable: {
    handle: '.widget-card__drag-handle'
  },
  columnOpts: {
    breakpoints: [
      { c: 12, w: 1200 },
      { c: 8,  w: 996 },
      { c: 4,  w: 768 },
      { c: 1,  w: 480 }
    ],
    layout: 'list'
  }
}, '#widget-grid');
```

When entering edit mode, call `grid.setStatic(false)` to enable drag and resize.
When exiting edit mode, call `grid.setStatic(true)` to lock the layout.

---

## Appendix B: Migration Checklist

Ordered implementation steps:

1. Add GridStack CDN links to `index.html` (CSS in head, JS before widget-system.js)
2. Remove SortableJS CDN link from `index.html`
3. Replace `<div class="widget-grid" id="...">` with `<div class="grid-stack" id="...">` in `index.html` (4 containers)
4. Add GridStack constraints (`minW`, `maxW`, `minH`, `maxH`, `noResize`) to every widget in `widget-registry.js`
5. Convert all 4 default layouts to `{id, x, y, w, h}` format in `widget-registry.js`
6. Rewrite `widget-system.js` core: remove SortableJS code, add GridStack init, update all CRUD operations
7. Bump `WIDGET_LAYOUT_VERSION` to 3 in `widget-system.js`
8. Update `getWidgetSize()` in `app.js` to read from `gridstackNode.w`
9. Update `rideops-theme.css`: remove old grid/size/sortable CSS, add GridStack overrides
10. Update chart-in-widget CSS selectors from `.widget-card` to `.grid-stack-item-content`
11. Test all 4 tabs: verify default layouts render correctly
12. Test edit mode: verify drag, resize, add, remove, reset all work
13. Test chart re-rendering: verify SVG charts re-render on threshold-crossing resize
14. Test responsive: verify column collapse at 1024px and 768px breakpoints
15. Test layout persistence: verify save/load cycle with version 3 format
16. Update `CLAUDE.md` documentation
