# RideOps Platform Audit Report

**Date:** 2026-03-02
**Auditor:** QA Audit Agent (Claude Opus 4.6)
**Codebase:** main branch, commit fc33b4e
**Server:** localhost:3000 with DEMO_MODE=true
**Scope:** 5-phase audit: Database, API, Entity Lifecycle, Browser UI, Cross-Cutting Concerns

---

## Executive Summary

**3 critical, 4 warnings, 5 notes** found across 100+ individual checks.

The platform is functionally solid: ride lifecycle works end-to-end, all 17 analytics endpoints return data, multi-campus theming applies correctly across all views, session-based auth is properly enforced on every endpoint, and all SQL queries use parameterized statements (no injection risk). The widget-based analytics dashboard, Chart.js charts, and academic terms feature all function correctly.

However, the platform has a **critical stored XSS vulnerability** affecting the office console and driver console where ride data (rider name, locations, notes) is interpolated into HTML templates without escaping. The rider console is safe -- it uses `escHtml()` consistently.

All critical issues from the 2026-03-01 pre-demo audit have been resolved: FOUC prevention is in place on all pages, `demo-config.js` 404 is gone, session security uses `connect-pg-simple`, all 16 database indexes exist, transactions wrap multi-step operations, graceful shutdown handlers are implemented, and a `/health` endpoint exists.

---

## Critical Issues (3)

### CRITICAL-1: Stored XSS in Office Console (app.js)

**Severity:** CRITICAL
**Impact:** An attacker who can submit a ride request (any authenticated rider) can inject arbitrary JavaScript that executes in the office staff's browser session. This could enable DOM manipulation, phishing overlays, and data exfiltration. The httpOnly cookie flag mitigates direct session cookie theft, but other attack vectors remain.

**Affected File:** `/Users/mazenabouelela/Documents/Projects/RideOps/public/app.js`

**Vulnerable Locations (ride data interpolated into HTML templates without escaping):**

| Line(s) | Function | Unescaped Field(s) |
|---------|----------|-------------------|
| 2343 | Rides table (renderAllRides) | `ride.riderName` |
| 2344 | Rides table (renderAllRides) | `ride.pickupLocation`, `ride.dropoffLocation` (also in `title` attribute) |
| 2346 | Rides table (renderAllRides) | `driverName` |
| 2487 | Pending queue (renderPendingQueue) | `ride.riderName` |
| 2488 | Pending queue (renderPendingQueue) | `ride.pickupLocation`, `ride.dropoffLocation` |
| 2744-2745 | Ride drawer (openRideDrawer) | `ride.pickupLocation`, `ride.dropoffLocation` |
| 2747 | Ride drawer (openRideDrawer) | `driverName` |
| 2749 | Ride drawer (openRideDrawer) | `ride.notes` (**highest risk: free-text user input**) |
| 2757-2758 | Ride drawer contact | `ride.riderPhone` in `href="tel:"` and `href="sms:"` attributes |

**Reproduction:**
1. Log in as rider `casey` (password: `demo123`)
2. Submit a ride with notes field set to: `<img src=x onerror="document.body.style.background='red'">`
3. Log in as `office`
4. View the ride in the rides table or open the ride drawer -- the injected payload executes

**Evidence:** Server stores `notes` directly from `req.body` without sanitization (server.js line 1993: `notes || ''`). The parameterized query prevents SQL injection but does nothing for HTML injection. The frontend inserts `ride.notes` directly into HTML template literals.

**Note:** `escapeHtml()` is available in `rideops-utils.js` (loaded by app.js) but is not used for ride data rendering. The `profileCardHTML()` function and notification drawer correctly use `escapeHtml()`, proving the utility exists and is available.

---

### CRITICAL-2: Stored XSS in Driver Console (driver.html)

**Severity:** CRITICAL
**Impact:** Same XSS vulnerability as CRITICAL-1, but targeting driver sessions. A malicious rider's injected payload executes in every driver's browser when they view available or claimed rides.

**Affected File:** `/Users/mazenabouelela/Documents/Projects/RideOps/public/driver.html`

**Vulnerable Locations (ride data interpolated into HTML templates without escaping):**

| Line(s) | Function | Unescaped Field(s) |
|---------|----------|-------------------|
| 204 | renderAvailableRide() | `ride.pickupLocation`, `ride.dropoffLocation` |
| 205 | renderAvailableRide() | `ride.riderName` |
| 263 | renderActiveRide() | `ride.pickupLocation`, `ride.dropoffLocation` |
| 266 | renderActiveRide() | `ride.notes` (**highest risk**) |
| 270 | renderActiveRide() | `vehicleName` |
| 292 | renderFutureRide() | `ride.riderName`, `ride.pickupLocation`, `ride.dropoffLocation` |
| 304 | renderCompletedRide() | `ride.riderName` |
| 215 | renderActiveRide() | `phone` in `href` attribute and display text |

**Note:** `driver.html` loads `rideops-utils.js` which provides `escapeHtml()`, but none of the ride rendering functions use it.

**Contrast:** `rider.html` is **safe** -- it defines its own `escHtml()` at line 1028 and uses it consistently for all user-supplied data (confirmed at lines 662, 685, 719, 726, 792, 799, 844, 912, 913).

---

### CRITICAL-3: No Server-Side HTML Sanitization of Ride Notes

**Severity:** CRITICAL
**Impact:** The `notes` field on rides is the most dangerous XSS vector because it accepts arbitrary free-text input from riders. Even if the frontend is patched to escape output, any future frontend code that renders notes without escaping would re-introduce the vulnerability.

**Affected File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`

**Location:** Line 1993 in `POST /api/rides` -- the `notes` value from `req.body` (line 1948) is stored directly via parameterized INSERT without any HTML entity encoding or tag stripping.

The same applies to `PUT /api/rides/:id` (line 2233+) where notes can be updated by office staff.

**Also unvalidated:** `riderPhone` (line 1979) has no format validation and could contain HTML/JS if injected into href attributes.

---

## Warnings (4)

### WARNING-1: signup.html Password Placeholder Misleads Users

**Severity:** WARNING
**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/public/signup.html`, line 91
**Issue:** Password input placeholder says `"At least 6 characters"` but the server enforces `MIN_PASSWORD_LENGTH = 8` (server.js line 1225).
**Impact:** Users will attempt 6-7 character passwords and receive a rejection error. Poor UX, no security impact.

---

### WARNING-2: db/schema.sql Drifts from Actual Database Schema

**Severity:** WARNING
**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/db/schema.sql`, line 169
**Issue:** `academic_terms.name` is defined as `TEXT NOT NULL` in schema.sql but the actual database column (created by `initDb()` in server.js) is `VARCHAR(50)`. The schema.sql file claims to reflect the schema created by `initDb()` (line 2: "This file reflects the schema as created by initDb()") but is inaccurate.
**Impact:** Developers relying on schema.sql as a reference will have incorrect expectations. No runtime impact.

---

### WARNING-3: Auth Middleware Returns 403 Instead of 401 for Unauthenticated Requests

**Severity:** WARNING
**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`
**Issue:** `requireAuth`, `requireOffice`, `requireStaff`, and `requireRider` middleware all return `403 Forbidden` when no session exists, rather than `401 Unauthorized`. HTTP semantics specify 401 for "not authenticated" and 403 for "authenticated but insufficient permissions."
**Impact:** API clients may misinterpret the response. Functional behavior is correct (access is denied).

**Evidence (tested via curl):**
- `GET /api/rides` (no session) -> 403 `{"error":"Unauthorized"}`
- `GET /api/admin/users` (no session) -> 403 `{"error":"Unauthorized"}`
- `GET /api/my-rides` (no session) -> 403 `{"error":"Unauthorized"}`

---

### WARNING-4: CLAUDE.md Documents Incorrect Settings API Format

**Severity:** WARNING
**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/CLAUDE.md`
**Issue:** The Testing Conventions section states: `Settings API expects array format: { data: [{ key: 'grace_period_minutes', value: '0' }] }`. The actual API (`PUT /api/settings`) expects a **bare array**: `[{ key: 'grace_period_minutes', value: '0' }]`. The `data` key is Playwright's request body wrapper, not part of the JSON payload.
**Impact:** Developers following CLAUDE.md will send the wrong payload format and receive error responses.

**Evidence (tested via curl):**
- Sending `{"data":[...]}` returns error: `"Expected array of { key, value }"`
- Sending `[{"key":"grace_period_minutes","value":"5"}]` returns 200 OK

---

## Notes (5)

### NOTE-1: Health Endpoint Not Wrapped in wrapAsync()

**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`, line 854
**Issue:** `GET /health` is the only async route handler not wrapped in `wrapAsync()`. It has its own try/catch so this is functionally safe, but it is inconsistent with the rest of the codebase.

---

### NOTE-2: No Pagination on Rides API

**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`, line 1929 (`GET /api/rides`)
**Issue:** Returns all rides on every 5-second polling cycle with no pagination, limit, or cursor. Listed in CLAUDE.md as a known issue. With 650+ demo rides, this works but will degrade at scale.

---

### NOTE-3: Phone Numbers Not Validated

**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`, line 1979
**Issue:** `riderPhone` from ride creation is stored without format validation. While the primary XSS risk is in the frontend rendering (covered in CRITICAL-1/2), the server also does not validate that phone numbers contain only digits, dashes, or parentheses.

---

### NOTE-4: Rate Limiting Disabled in Development

**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`, lines 864-877
**Issue:** Login rate limiter allows 1000 requests/15min in development mode (vs 10 in production). Signup allows 1000/15min (vs 5 in production). This is intentional for development but worth noting.

---

### NOTE-5: Default Credentials Logged to Console in Development

**File:** `/Users/mazenabouelela/Documents/Projects/RideOps/server.js`, line 5248
**Issue:** Default login credentials are logged to the server console on startup in non-production mode. This is guarded by `if (!isProduction)` so it is safe, but the credentials are visible in terminal output.

---

## Phase-by-Phase Results

### Phase 1: DATABASE AUDIT -- PASS

**Tables verified (15):** users, shifts, rides, ride_events, recurring_rides, rider_miss_counts, vehicles, maintenance_logs, clock_events, tenant_settings, notification_preferences, notifications, program_content, academic_terms, session (auto-created by connect-pg-simple).

**Checks passed:**
- All 15 tables exist with correct column names, types, and constraints
- All 16 custom indexes exist and match schema.sql definitions
- Foreign keys verified: rides->users (rider_id, assigned_driver_id), rides->vehicles, shifts->users, ride_events->rides, clock_events->users, maintenance_logs->vehicles, notification_preferences->users, notifications->users, recurring_rides->users
- CASCADE deletes confirmed on: ride_events, recurring_rides, maintenance_logs, notification_preferences, notifications
- Unique constraints verified: users.username, users.email, vehicles.name, tenant_settings.setting_key, notification_preferences(user_id, event_type, channel)
- CHECK constraint on academic_terms: `end_date > start_date` confirmed
- No orphaned records found (rides referencing non-existent users, clock_events referencing non-existent employees)
- No `$1::uuid[]` casts found in server.js (all IDs are text format)

**Checks with findings:**
- [WARNING-2] db/schema.sql academic_terms.name type mismatch (TEXT vs VARCHAR(50))

---

### Phase 2: API AUDIT -- PASS (with findings)

**Endpoints tested:** 60+ endpoints across auth, config, admin, profile, employees, shifts, rides, recurring rides, vehicles, analytics, settings, notifications, academic terms.

**Auth endpoints:**
- POST /api/auth/login -- 200 with valid credentials, 401 with invalid
- POST /api/auth/logout -- 200
- GET /api/auth/me -- 200 with session, 403 without
- GET /api/auth/signup-allowed -- 200

**Authorization enforcement (all passed):**
- requireOffice endpoints (admin, settings, analytics) -- 403 for driver/rider role
- requireStaff endpoints (rides list, employees) -- 403 for rider role
- requireRider endpoints (my-rides, recurring-rides) -- 403 for non-rider role
- requireAuth endpoints (ride creation, profile) -- 403 for no session

**Ride lifecycle (all passed):**
- Create ride -- 200 with valid data, 400 for missing fields
- Approve/Deny -- 200
- Claim (driver) -- 200
- On-the-way -- 200 (requires vehicle assigned first)
- Here (arrive) -- 200
- Complete -- 200
- No-show -- 200
- Cancel (rider cancels pending) -- 200

**Error handling (all passed):**
- Non-existent ride ID returns 404 (not 500)
- Missing required fields return 400 with descriptive error messages
- Driver clock-out with active rides returns 409

**Analytics endpoints (17 tested, all 200):**
summary, hotspots, frequency, vehicles, milestones, semester-report, tardiness, ride-volume, ride-outcomes, peak-hours, routes, driver-performance, driver-utilization, rider-cohorts, rider-no-shows, fleet-utilization, shift-coverage, export-report

**Academic terms CRUD (all passed):**
- POST create -- 200
- GET list -- 200
- PUT update -- 200
- DELETE -- 200
- Invalid date range (end < start) -- 400

**Findings:**
- [WARNING-3] 403 instead of 401 for unauthenticated requests
- [WARNING-4] CLAUDE.md documents incorrect settings payload format

---

### Phase 3: ENTITY LIFECYCLE AUDIT -- PASS

**Ride lifecycle (full path tested):**
1. Create ride (pending) -- verified all fields stored correctly
2. Approve (approved) -- status updated, ride event logged
3. Set vehicle -- vehicle_id assigned
4. Claim by driver (scheduled) -- assigned_driver_id set
5. On-the-way (driver_on_the_way) -- status updated
6. Here (driver_arrived_grace) -- grace_start_time set
7. Complete (completed) -- terminal state reached, miss count reset

**No-show path tested:**
- Grace period enforced before no-show allowed
- Miss count increments in rider_miss_counts table

**Cancel path tested:**
- Rider can cancel pending/approved rides
- cancelled_by field set to 'rider'

**Deny path tested:**
- Office can deny pending rides
- Status set to 'denied'

**Business rules verified:**
- Service hours enforcement (rides outside hours rejected with 400)
- Driver must be clocked in to claim rides
- Vehicle required before "On My Way"
- Clock-out guard: driver cannot clock out with active rides (409)

---

### Phase 4: BROWSER AUDIT -- PASS

**Pages tested:**
- `/login` -- Campus selector loads with all 4 campuses, no console errors
- `/usc/login` -- USC DART branding applied, correct tagline, login form functional
- `/usc` (office console) -- Dispatch panel loads with KPI cards, pending queue, today's board. Analytics tab loads all widgets. No console errors.
- `/usc/driver` -- DART branding, clock-in button, bottom tabs functional. No console errors.
- `/usc/rider` -- Auto-switches to My Rides when active rides exist. Hero card displays. Cancel buttons present. No console errors.

**Mobile responsiveness (375px width):**
- Rider page: Layout renders correctly, no horizontal overflow

**Tenant theming:**
- USC branding applies correctly (crimson primary, DART org name)
- All 4 campus configs return correct tenant data via API

**No console errors detected on any page.**

---

### Phase 5: CROSS-CUTTING CONCERNS -- FAIL (Critical XSS)

**Security (findings):**
- [CRITICAL-1] Stored XSS in app.js (12 unescaped interpolation points)
- [CRITICAL-2] Stored XSS in driver.html (8 unescaped interpolation points)
- [CRITICAL-3] No server-side HTML sanitization of ride notes

**Security (passed):**
- All SQL queries use parameterized statements -- no SQL injection
- No secrets, API keys, or password hashes in frontend code
- Session cookies: httpOnly=true, sameSite='lax', secure=true in production
- connect-pg-simple session store (not in-memory)
- Rate limiting on login (10/15min) and signup (5/15min) in production
- Password hashing with bcrypt, MIN_PASSWORD_LENGTH=8
- Static file serving limited to `public/` directory only
- Credentials only logged in non-production mode
- Global error handler exists at line 5198 (last middleware, returns generic 500)
- Graceful shutdown handlers for SIGTERM/SIGINT with 15s drain timeout
- Startup recovery: stuck rides reverted to 'scheduled', driver active states reset

**Code quality (passed):**
- No Material Symbols usage (all Tabler Icons)
- No legacy `showToast()` or `showConfirmModal()` calls
- No `$1::uuid[]` casts
- `wrapAsync()` covers all async route handlers (except /health which has its own try/catch)
- `.tab-panel` / `.sub-panel` CSS visibility rules intact at rideops-theme.css lines 78-81
- CDN dependencies properly loaded (no npm-installed versions)
- FOUC prevention scripts present in all HTML pages

**Findings:**
- [WARNING-1] signup.html password placeholder says 6 characters, server enforces 8

---

## Recommended Fix Priority

### Immediate (before any user-facing deployment)
1. **CRITICAL-1 + CRITICAL-2: Patch XSS in app.js and driver.html** -- Add `escapeHtml()` calls around all ride data interpolated into HTML templates. The function already exists in `rideops-utils.js`. Estimated effort: 1-2 hours.
2. **CRITICAL-3: Add server-side sanitization** -- Strip HTML tags from `notes`, `riderPhone`, and potentially `pickupLocation`/`dropoffLocation` on the server before storage. This provides defense-in-depth. Estimated effort: 30 minutes.

### Before next release
3. **WARNING-1: Fix signup.html placeholder** -- Change "At least 6 characters" to "At least 8 characters". 1-minute fix.
4. **WARNING-2: Update db/schema.sql** -- Change `name TEXT NOT NULL` to `name VARCHAR(50) NOT NULL` for academic_terms. 1-minute fix.
5. **WARNING-3: Use 401 for unauthenticated, 403 for unauthorized** -- Update auth middleware to distinguish between missing session (401) and insufficient role (403). 15-minute fix.
6. **WARNING-4: Correct CLAUDE.md settings API format** -- Update the test conventions section to show the bare array format. 1-minute fix.

### Tech debt (no urgency)
7. NOTE-1: Wrap /health in wrapAsync for consistency.
8. NOTE-2: Add pagination to rides API (documented known issue).
9. NOTE-3: Add phone number format validation.
10. NOTE-4, NOTE-5: Informational only, no action needed.

---

## Appendix: Items Resolved Since Last Audit (2026-03-01)

The following critical issues from the previous audit have been **verified resolved**:

| Previous Issue | Status |
|---------------|--------|
| Weekend/evening demos blocked by service hours | RESOLVED -- configurable operating days |
| Office console FOUC on campus-themed URLs | RESOLVED -- synchronous FOUC prevention script in all pages |
| demo-config.js 404 on every page | RESOLVED -- file removed/no longer referenced |
| Hardcoded SESSION_SECRET fallback | RESOLVED -- random fallback in dev, required in production |
| In-memory session store | RESOLVED -- connect-pg-simple PostgreSQL store |
| No secure cookie flag | RESOLVED -- secure=isProduction |
| No rate limiting on login | RESOLVED -- express-rate-limit on login and signup |
| SQL injection via timezone config | RESOLVED -- timezone validated against pg_timezone_names |
| No health check endpoint | RESOLVED -- GET /health with DB connectivity check |
| Zero indexes on rides table | RESOLVED -- 7 indexes on rides table confirmed |
| Multi-step operations lack transactions | RESOLVED -- transactions used for no-show, completion, etc. |
| No graceful shutdown | RESOLVED -- SIGTERM/SIGINT handlers with 15s drain timeout |
| Demo page uses browser alert() | RESOLVED -- uses styled toasts |
