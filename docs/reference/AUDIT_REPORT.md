# RideOps Pre-Demo Audit Report

**Date:** 2026-03-01
**Audited by:** Claude Code (5-agent parallel sweep)
**Agents:** Backend/API Integrity, Demo Premortem, Data Model/Business Logic, Frontend Quality, Architecture/Deployment
**Codebase:** main branch, commit 69387cb (~10,900 lines backend, ~6,040 lines frontend JS)

---

## Executive Summary

RideOps is a feature-rich, well-designed campus transportation platform with impressive multi-tenant theming, a comprehensive analytics dashboard, real-time three-role workflows, and polished UI built on Tabler. The business logic is sound and the multi-campus architecture is clean. However, the platform is **not production-ready** and has several issues that would surface during a live demo or university IT evaluation.

**Critical blockers for demos:** Weekend/evening demos are impossible without changing service hour settings (today is Sunday). The office console flashes default blue before campus colors load (FOUC). The demo page uses jarring browser `alert()` instead of styled toasts. A missing `demo-config.js` file causes 404 errors on every page load.

**Critical blockers for production/sales:** Session security is weak (hardcoded fallback secret, in-memory store, no secure cookies). There is no rate limiting on login. SQL injection is possible via the timezone tenant config. No health check endpoint exists. The `rides` table has zero indexes — analytics will degrade with real data. Multi-step operations (no-show, completion) lack database transactions. No graceful shutdown handler exists.

**The good news:** All critical issues are low-effort fixes (1-3 days total). The platform's core functionality, analytics suite, and campus theming are genuinely impressive and demo-ready once these polish items are addressed.

---

## Critical Issues (Must Fix Before Demo)

### 1. Weekend/Evening Demos Blocked by Service Hours
**Source:** Premortem, Business Logic
**Impact:** The entire ride creation flow is blocked outside Mon-Fri 8am-7pm. Today is Sunday.
**Location:** `server.js:1714` — `isWithinServiceHours()` always enforced, no demo bypass
**Fix:** Before demo: Settings > Business Rules → change operating days to 0-6, hours to 00:00-23:59. Or add `if (DEMO_MODE) return true;` to `isWithinServiceHours()`.

### 2. Office Console FOUC on Campus-Themed URLs
**Source:** Premortem, Frontend
**Impact:** Sidebar/header flash default blue then switch to campus color (~100-200ms visible).
**Location:** `index.html` — missing synchronous color IIFE that `driver.html` and `rider.html` already have
**Fix:** Copy the synchronous IIFE from `driver.html:13-26` into `index.html` after the `campus-themes.js` script tag.

### 3. `demo-config.js` File Missing — 404 on Every Page
**Source:** Frontend
**Impact:** All 6 HTML pages load `<script src="/demo-config.js">` but the file doesn't exist. 404 + potential JS error on every page load, visible in DevTools console.
**Fix:** Create `public/demo-config.js` with expected exports, or remove the script tag from all pages if unused.

### 4. Demo Page Uses Browser `alert()` for Errors
**Source:** Premortem, Frontend
**Impact:** If login fails during demo, audience sees a native browser alert box. Every other page uses styled toasts.
**Location:** `demo.html:182,186`
**Fix:** Replace `alert()` with `showToast()` and load `utils.js` before the inline script.

### 5. Session Secret Hardcoded with No Startup Validation
**Source:** Architecture
**Impact:** Fallback secret `'rideops-secret-change-in-production'` enables session forgery if `SESSION_SECRET` env var is unset. Not documented in README.
**Location:** `server.js:115`
**Fix:** Add startup check that refuses to start without `SESSION_SECRET` in production.

### 6. SQL Injection via Timezone Setting
**Source:** Architecture, Premortem
**Impact:** `TENANT.timezone` is interpolated directly into SQL without parameterization. Malicious tenant config → full SQL injection.
**Location:** `server.js:109` — `` client.query(`SET timezone = '${TENANT.timezone}'`) ``
**Fix:** Change to `client.query('SET timezone = $1', [TENANT.timezone])`.

### 7. No Rate Limiting on Authentication
**Source:** Architecture, Data Model, Premortem
**Impact:** Login and signup endpoints accept unlimited requests. Brute-force possible, especially with default `demo123` password.
**Fix:** `npm install express-rate-limit` and apply to `/api/auth/login` and `/api/auth/signup`.

### 8. In-Memory Session Store
**Source:** Architecture, Premortem
**Impact:** All sessions lost on every server restart/deploy. Memory leak over time. Blocks horizontal scaling.
**Location:** `server.js:114-119` — no `store` option
**Fix:** Add `connect-pg-simple` as session store (uses existing PostgreSQL).

### 9. Session Cookie Security Disabled
**Source:** Architecture
**Impact:** `secure: false` sends cookie over HTTP. No `sameSite` set (CSRF risk). No conditional for production.
**Location:** `server.js:118`
**Fix:** Set `secure: true` and `sameSite: 'lax'` when `NODE_ENV === 'production'`, add `trust proxy`.

### 10. No Graceful Shutdown
**Source:** Architecture
**Impact:** No SIGTERM/SIGINT handlers. Deploys drop in-flight requests, leave DB connections open.
**Fix:** Add 15-line shutdown handler: stop accepting connections, drain pool, exit.

---

## High Priority (Should Fix Before Sales Conversations)

### 11. Missing Database Indexes — Performance Time Bomb
**Source:** Data Model, Architecture
**Impact:** `rides` table has ZERO indexes beyond PK. 10 concurrent office sessions = 120 full table scans/minute. Analytics with 1000+ rides will be slow.
**Missing:** `rides(status)`, `rides(requested_time)`, `rides(rider_email)`, `rides(assigned_driver_id)`, `rides(rider_id)`, `rides(vehicle_id)`, `ride_events(ride_id)`, `shifts(employee_id)`

### 12. No Database Transactions for Multi-Step Operations
**Source:** Data Model
**Impact:** No-show handler, completion, cancellation do 3+ queries without transaction. Server crash mid-flow → inconsistent data (miss count incremented but ride status unchanged).
**Location:** `server.js:2232-2329` (no-show), `2198-2230` (complete)

### 13. Stored XSS via Program Rules HTML
**Source:** Data Model, Architecture
**Impact:** Only `<script>` tags blocked. `<img onerror="...">`, `<svg onload="...">`, `<a href="javascript:...">` all pass through.
**Location:** `server.js:796`
**Fix:** Strip all `on*` event attributes: `rulesHtml.replace(/\bon\w+\s*=/gi, '')`.

### 14. Office Grace Timer Hardcoded to 5 Minutes
**Source:** Premortem
**Impact:** Office and driver views show different countdowns if grace period setting is changed from default.
**Location:** `app.js:2812` — `const remaining = Math.max(0, 300 - elapsed);`
**Fix:** Replace `300` with `(tenantConfig?.grace_period_minutes || 5) * 60`.

### 15. Rider "Termination" Is Not Enforced — Only Advisory
**Source:** Data Model
**Impact:** When rider hits max no-shows, notification says "Account deactivated" but rider can still log in, submit rides. Only enforcement: office can't approve. Rider sees a broken experience (rides stuck pending forever).

### 16. `uscId` Field Name Leaked in Signup API
**Source:** Premortem
**Impact:** Stanford/UCLA evaluators inspecting network requests will see their member ID sent as "uscId" — undermines multi-tenant credibility.
**Location:** `signup.html:159`, `server.js:1038,1116,1159`
**Fix:** Rename to `memberId` across ~15 locations.

### 17. Synchronous bcrypt Blocks Event Loop
**Source:** Architecture
**Impact:** `bcrypt.hashSync()` and `bcrypt.compareSync()` block ~80-120ms per call. During login/signup, all other requests (including polling) stall.
**Location:** `server.js:121,723,1023,1026,1057,1135,1259`
**Fix:** Switch to async `bcrypt.hash()` and `bcrypt.compare()`.

### 18. Many Async Route Handlers Lack try/catch
**Source:** Architecture
**Impact:** ~20+ async route handlers have no error wrapping. Database connection blip → client hangs with no response.
**Fix:** Wrap all async handlers or add Express 5-style async error middleware.

### 19. No Health Check Endpoint
**Source:** Architecture
**Impact:** Deployment platforms can't distinguish "app booting" from "app crashed". Zero-downtime deploys impossible.
**Fix:** Add `/health` endpoint returning `{ status: "ok", db: "connected" }`.

### 20. Hardcoded Hex Colors in `app.js`
**Source:** Frontend
**Impact:** ~10 hardcoded colors (`#c62828`, `#28a745`, `#dc3545`, `#f5f5f5`) that won't adapt to campus themes.
**Location:** `app.js:504,515,565,576,785,2070,2073`

### 21. `utils.js` showEmptyState Uses Material Symbols (Deprecated)
**Source:** Frontend, Premortem
**Impact:** Renders `<span class="material-symbols-outlined">` but no page loads that font. Icon renders as invisible text.
**Location:** `utils.js:158`
**Fix:** Change to `<i class="ti ti-${icon}"></i>`.

### 22. Phantom Notification Event Types
**Source:** Data Model
**Impact:** `driver_no_clock_in`, `daily_summary`, and `ride_completed` (office) event types appear in notification preferences but are never dispatched. Settings UI promises features that don't work.

### 23. `auto_deny_outside_hours` Setting Has No Effect
**Source:** Data Model
**Impact:** Setting exists in UI and DB but ride creation always enforces service hours regardless of its value.

### 24. 30+ Console Error/Warn Statements Visible During Demo
**Source:** Premortem, Frontend
**Impact:** Technical evaluator opening DevTools sees red/yellow messages on every failed fetch or analytics timing issue.

### 25. CDN Dependencies — Offline/Slow Network Kills UI
**Source:** Premortem
**Impact:** Tabler CSS/Icons, FullCalendar, Quill, SortableJS all load from jsdelivr CDN. Conference WiFi or corporate firewall → unstyled HTML.
**Mitigation:** Pre-cache in browser before demo. For production: vendor locally.

### 26. No SSO/SAML/LDAP Integration
**Source:** Premortem
**Impact:** Deal-breaker for universities with mandatory SSO policies (UCLA, Stanford both require this).
**Mitigation:** Prepare roadmap slide showing SSO as near-term deliverable.

---

## Medium Priority (Polish Items)

### 27. Password Minimum Inconsistency (6 vs 8 characters)
Signup requires 6, change-password requires 8, admin-create has no minimum.
**Location:** `server.js:1045` vs `1017` vs `1115`

### 28. No Pagination on `GET /api/rides`
Returns ALL rides every 5 seconds. Payload grows with data volume.

### 29. Driver Can Clock Out with Active Rides
Rides in `scheduled`/`driver_on_the_way`/`driver_arrived_grace` become stranded.

### 30. Demo Data Re-seeds Every Hour
**Location:** `server.js:4780-4782` — `setInterval` re-seeds all demo data hourly. Mid-demo changes get overwritten.

### 31. `rider_miss_counts` Tracks by Email Without Foreign Key
Changing a rider's email resets their strike counter. Old email's count orphaned.

### 32. Email Env Var Naming Mismatch
Code reads `FROM_NAME`/`FROM_EMAIL` but docs say `NOTIFICATION_FROM`/`NOTIFICATION_FROM_NAME`.

### 33. Notification Email Templates Hardcode "RideOps"
USC DART emails should say "USC DART" but always say "RideOps".
**Location:** `notification-service.js:9-10`

### 34. Two Toast Systems Coexist
`showToast()` (utils.js) and `showToastNew()` (rideops-utils.js) render visually different notifications. Both used in `app.js`.

### 35. Two Modal Systems Coexist
`showConfirmModal()` (utils.js) and `showModalNew()` (rideops-utils.js) use different CSS class systems.

### 36. Deprecated `styles.css` File Still Present
Contains old Material Symbols imports and USC-hardcoded colors. Not loaded but could confuse developers.

### 37. `form-select` CSS Class Used but Never Defined
**Location:** `driver.html:863` — vehicle selector falls back to unstyled browser defaults.

### 38. Inline Styles Used Extensively in driver.html / rider.html
Heavy inline `style=""` attributes instead of CSS classes. Harder to maintain and override.

### 39. Graduation Year Options Static (2024-2030)
Hardcoded in driver.html and rider.html. Will be outdated by 2027.

### 40. No UNIQUE Constraint on Shift Duplication
Overlapping shifts for same driver can be created without error.

### 41. Vehicles Have No UNIQUE Constraint on Name
Duplicate "Cart 1" entries possible, confusing in UI.

### 42. Polling Fires Continuously Regardless of Tab Visibility
No `visibilitychange` listener. Backgrounded tabs waste server resources.
**Location:** `app.js:6034-6038`

### 43. `db/schema.sql` is Stale and Incomplete
Missing 4 tables and ~15 columns added via migrations. Misleading as reference doc.

### 44. `server.js` is 4,838 Lines / `app.js` is 6,040 Lines
Monolith files make code review, testing, and onboarding difficult.

### 45. No `trust proxy` Configuration
Behind a reverse proxy: `req.ip` wrong, `secure: true` cookies don't work.

### 46. No Node.js Version Specified
No `engines` in package.json, no `.nvmrc`. Platform picks arbitrary version.

### 47. Recurring Ride Date Generation Timezone Risk
Near midnight, UTC vs local date can differ → rides generated on wrong day.

### 48. Rides Stuck in Non-Terminal States After Restart
`driver_on_the_way` and `driver_arrived_grace` rides are permanently stuck with no recovery routine.

---

## Low Priority (Nice to Have)

### 49. Untracked Development Files in Working Directory
40+ PNG screenshots, `tabler/` directory, `linkedin_shots*.js`, `.xlsx` reports in root.

### 50. `.gitignore` Missing Common Patterns
No rules for `*.png`, `*.xlsx`, `tabler/`, `.claude/`, `.playwright-mcp/`.

### 51. Inconsistent Login Redirect Paths
`rider.html` redirects to `/login.html` (with extension), `driver.html` to `/login` (without). Non-org-scoped.

### 52. Generic Page Titles Before JS Updates
Initial `<title>` flashes "Operations Console" before JS changes to org name.

### 53. Login/Signup Pages Use Empty `catch {}` Blocks
Silent error swallowing — no feedback if tenant-config API fails.

### 54. `defaultPasswordHash` Computed Synchronously at Startup
Blocks event loop ~100ms. Could be a pre-computed constant.

### 55. Notification Badge Uses Hardcoded `#EF4444`
Should use `var(--status-no-show)`. Functionally identical but breaks convention.
**Location:** `rideops-theme.css:868`

### 56. `!important` Overrides in FullCalendar/Quill Theming
~30+ `!important` declarations. Unavoidable for CDN library theming but fragile.

### 57. `ride_events.actor_user_id` Set to NULL on User Deletion
Audit trail loses record of who performed actions. Soft-delete would preserve history.

### 58. README.md Missing Key Information for Technical Buyers
No accessibility statement, security posture, architecture diagram, scaling guidance, or FERPA considerations.

---

## Suggestions & Strategic Recommendations

### Highest-Impact, Lowest-Effort Improvements (1-2 days each)

1. **Fix session security** — Add `SESSION_SECRET` validation, `connect-pg-simple` store, secure cookie settings, `trust proxy`. Eliminates Critical #5, #8, #9.

2. **Add database indexes** — 10 `CREATE INDEX IF NOT EXISTS` statements in `runMigrations()`. Eliminates High #11.

3. **Add `/health` endpoint** — 10 lines. Unlocks proper deployment on Railway/Render/Fly.io.

4. **Add rate limiting** — `express-rate-limit`, 10 lines. Eliminates Critical #7.

5. **Add graceful shutdown** — 15 lines. Eliminates Critical #10.

6. **Fix FOUC on office console** — Copy synchronous IIFE from driver.html. Eliminates Critical #2.

### Demo "Wow Factor" Features Already Built

1. **Multi-campus theming** — Switching between USC cardinal, Stanford red, UCLA blue, UCI blue in one platform is visually stunning. Lead with this.

2. **Analytics widget dashboard** — 16 widgets with drag-and-drop, campus-themed charts, Excel export. Enterprise-grade. Show this prominently.

3. **Three-role real-time workflow** — Office approve → driver claim → rider tracking across three browser tabs simultaneously. Demonstrates the complete value chain.

4. **Excel export** — Multi-sheet `.xlsx` with conditional formatting. Download one during the demo.

5. **Notification system** — 9 event types, per-user preferences, email + in-app channels. Feature competitors charge extra for.

### What to Build Next for Competitive Advantage

1. **SSO/SAML integration** — Required by most universities. Biggest deal-blocker.
2. **Real-time driver location on map** — Currently just an iframe to campus map. Integrated map with driver pins would be transformative.
3. **Rider SMS notifications** — Phone numbers already collected. Twilio for "Driver on the way" and "Driver arrived" would differentiate.
4. **PDF ride receipts** — Universities need paper trails for disability services. "Download Receipt" on completed rides closes ADA compliance deals.
5. **API documentation (OpenAPI/Swagger)** — Makes integration conversations concrete instead of theoretical.
6. **Audit log / activity feed** — `ride_events` table already has the data. Exposing as visible timeline demonstrates compliance readiness.

### 1-Hour Pre-Demo Checklist

1. Start server with `DEMO_MODE=true node server.js`
2. Log in as `office`/`demo123`, go to Settings > Business Rules
3. Change operating days to all 7 days, hours to 00:00-23:59
4. Pre-populate Program Guidelines with real content
5. Load the app once on demo network to cache CDN resources
6. Open office, driver, and rider views in separate tabs
7. Use analytics "Month" button to ensure data is visible
8. Do NOT open DevTools during the demo

---

## Appendix: Agent Reports

### Agent 1: Backend & API Integrity
The audit agent performed static code analysis on `server.js` (4,838 lines), `email.js`, `notification-service.js`, and `tenants/` directory. Key findings were incorporated into Critical #5-10 and High #13, #17-19 above. All documented API endpoints exist and are properly implemented. Role-based middleware correctly guards endpoints. Parameterized queries are used everywhere except the timezone setting (Critical #6). The `usc_id → member_id` migration in the column name is complete but the API field name `uscId` persists (High #16).

### Agent 2: Demo Premortem
Identified 19 risks across 4 severity levels with specific 15-minute fixes for each. The single biggest demo risk is service hours blocking weekend demos (Critical #1). Provided a detailed 1-hour pre-demo action plan and competitive readiness analysis. Key gap areas: no SSO, no FERPA documentation, no push notifications, no real-time GPS tracking, no automated dispatch.

### Agent 3: Data Model & Business Logic
Found 5 critical, 9 high, 10 medium findings. The most impactful are: missing database indexes (Critical #11), no transactions on multi-step operations (Critical #12), rider termination being advisory-only (High #15), and three phantom notification event types that appear in settings but never fire (High #22). The `auto_deny_outside_hours` setting has no effect on code behavior (High #23).

### Agent 4: Frontend Quality & Consistency
Found 4 critical, 7 high, 9 medium, 8 low findings across all 14 frontend files. Critical: missing `demo-config.js`, Material Symbols in legacy `showEmptyState()`, `alert()` in demo page, undefined `form-select` CSS class. Notable: two toast systems and two modal systems coexist from design iteration. Hardcoded hex colors in `app.js` (~10 instances) won't adapt to campus themes.

### Agent 5: Architecture & Deployment
Found 6 critical, 7 high, 8 medium, 8 low findings. Session security (hardcoded secret, in-memory store, insecure cookies) is the top cluster. No graceful shutdown, no health check, no `trust proxy`, and synchronous bcrypt calls are the key production blockers. Email env var naming mismatches documentation. `server.js` at 4,838 lines and `app.js` at 6,040 lines are monolith risks for maintainability. Polling intervals don't pause on backgrounded tabs.

---

**Total Findings: 58**
| Severity | Count |
|----------|-------|
| Critical | 10 |
| High | 16 |
| Medium | 22 |
| Low | 10 |

**Estimated fix time for Critical + High items: 3-5 developer-days**
**Estimated fix time for all items: 2-3 developer-weeks**
