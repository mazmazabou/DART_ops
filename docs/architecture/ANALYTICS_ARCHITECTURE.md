# Analytics Architecture for RideOps

**Version:** 1.0
**Date:** 2026-02-28
**Context:** Reserve-ahead scheduled ride service (NOT on-demand). All metrics focus on completion rates, scheduling efficiency, punctuality, no-show patterns, shift coverage, and fleet utilization. No wait-time or SLA-response-time metrics.

---

## Table of Contents

1. [Data Audit](#1-data-audit)
2. [Computable Metrics Catalog](#2-computable-metrics-catalog)
3. [Existing Endpoints (Reference)](#3-existing-endpoints-reference)
4. [New API Endpoint Specifications](#4-new-api-endpoint-specifications)
5. [Excel Report Schema](#5-excel-report-schema)
6. [Dashboard Layout](#6-dashboard-layout)
7. [Date Range Architecture](#7-date-range-architecture)
8. [Implementation Notes](#8-implementation-notes)

---

## 1. Data Audit

For each table, every metric computable from existing columns.

### 1.1 `users`

| Column(s) | Computable Metric | Type |
|---|---|---|
| `role` | Count by role (office, driver, rider) | Aggregate |
| `active` (where role=driver) | Currently clocked-in driver count | Snapshot |
| `created_at` | New user registrations over time | Time series |
| `created_at` + `role='rider'` | Rider growth rate (new riders/week) | Trend |
| `created_at` + `role='driver'` | Driver onboarding timeline | Trend |
| `updated_at` vs `created_at` | Profile update frequency | Distribution |
| `major` | Rider distribution by academic major | Categorical |
| `graduation_year` | Rider distribution by graduation year | Categorical |
| `must_change_password` | Pending password-change count | Snapshot |

### 1.2 `shifts`

| Column(s) | Computable Metric | Type |
|---|---|---|
| `start_time`, `end_time` | Scheduled hours per shift | Calculated |
| `employee_id` + `day_of_week` | Shifts per driver per week | Aggregate |
| `day_of_week` | Shift coverage by day (Mon-Fri) | Distribution |
| SUM(`end_time - start_time`) | Total scheduled driver-hours per week | Aggregate |
| `week_start` (NULL vs set) | Recurring vs one-off shift ratio | Ratio |
| COUNT DISTINCT `employee_id` per `day_of_week` | Driver count per day | Aggregate |
| `start_time`, `end_time` per hour bucket | Hour-by-hour driver availability | Heatmap |

### 1.3 `rides`

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT(*) | Total ride requests | Aggregate |
| `status = 'completed'` | Completed rides | Aggregate |
| `status = 'no_show'` | No-show count | Aggregate |
| `status = 'cancelled'` | Cancellation count | Aggregate |
| `status = 'denied'` | Denial count | Aggregate |
| `status IN (pending,approved,scheduled,driver_on_the_way,driver_arrived_grace)` | Active/in-progress rides | Snapshot |
| completed / total | Completion rate | Ratio |
| no_show / (completed + no_show) | No-show rate (among fulfilled) | Ratio |
| cancelled / total | Cancellation rate | Ratio |
| denied / total | Denial rate | Ratio |
| `requested_time` by DATE | Rides per day | Time series |
| `requested_time` by HOUR | Rides per hour-of-day | Distribution |
| `requested_time` by DOW | Rides by day-of-week | Distribution |
| `requested_time` by DOW x HOUR | Peak hours heatmap (Mon-Fri x 8am-7pm) | Heatmap |
| `pickup_location` | Top pickup locations | Ranked list |
| `dropoff_location` | Top dropoff locations | Ranked list |
| `pickup_location` + `dropoff_location` | Route frequency (OD pairs) | Ranked list |
| Completion rate per route | Route reliability | Per-route metric |
| DISTINCT `rider_email` | Unique riders served | Aggregate |
| DISTINCT `rider_email` WHERE completed | People actually helped | Aggregate |
| DISTINCT `assigned_driver_id` | Active drivers (with rides) | Aggregate |
| `assigned_driver_id` + COUNT | Rides per driver | Per-driver metric |
| `assigned_driver_id` + completed/no_show | Driver completion vs no-show ratio | Per-driver metric |
| `vehicle_id` + COUNT | Rides per vehicle | Per-vehicle metric |
| `vehicle_id` WHERE `type='accessible'` vs `type='standard'` (joined) | Accessible vs standard demand | Ratio |
| `recurring_id` IS NOT NULL | Recurring vs one-off ride ratio | Ratio |
| `cancelled_by` | Cancellation source (rider vs office) | Categorical |
| `rider_email` + no_show count | No-show repeat offenders | Per-rider metric |
| `rider_email` first ride date vs last ride date | Rider tenure | Per-rider metric |
| `rider_email` + ride count in period vs prior period | Active/churned/new rider cohorts | Cohort |
| `created_at` vs `requested_time` | Advance booking lead time | Distribution |

### 1.4 `ride_events`

| Column(s) | Computable Metric | Type |
|---|---|---|
| `type` + `at` per ride_id | Full ride lifecycle timeline | Per-ride audit |
| `type = 'approved'` timestamp - `type = 'requested'` timestamp | Time from request to approval | Duration (NOTE: available but not surfaced as KPI per requirements) |
| `type = 'completed'` or `type = 'no_show'` count over time | Terminal event trend | Time series |
| DISTINCT `actor_user_id` WHERE type = 'approved' | Which office staff approve most | Per-actor metric |
| COUNT by `type` | Event type distribution | Distribution |

### 1.5 `recurring_rides`

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT(*) | Total recurring ride templates | Aggregate |
| `status = 'active'` | Active recurring templates | Aggregate |
| `days_of_week` array length | Average days per recurring ride | Average |
| `start_date`, `end_date` | Recurring ride duration distribution | Distribution |
| `pickup_location`, `dropoff_location` | Most common recurring routes | Ranked list |
| DISTINCT `rider_id` | Riders with recurring rides | Aggregate |

### 1.6 `rider_miss_counts`

| Column(s) | Computable Metric | Type |
|---|---|---|
| `count` distribution | Strike count histogram (0, 1, 2, 3, 4, 5+) | Distribution |
| `count >= max_no_show_strikes` | Terminated riders count | Aggregate |
| `count = max_no_show_strikes - 1` | At-risk riders (one strike from termination) | Aggregate |
| AVG(`count`) | Average strikes per rider | Average |

### 1.7 `vehicles`

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT by `status` | Vehicle availability (available/in_use/retired) | Snapshot |
| COUNT by `type` | Fleet composition (standard vs accessible) | Ratio |
| `total_miles` | Total fleet mileage | Aggregate |
| `last_maintenance_date` | Days since last maintenance per vehicle | Per-vehicle metric |
| `last_maintenance_date` > 30 days ago | Maintenance overdue count | Aggregate |

### 1.8 `maintenance_logs`

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT per `vehicle_id` | Maintenance events per vehicle | Per-vehicle metric |
| `service_date` frequency | Maintenance frequency (events per month) | Time series |
| `mileage_at_service` deltas | Miles between maintenance events | Per-vehicle metric |
| `performed_by` | Maintenance by staff member | Per-actor metric |

### 1.9 `clock_events`

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT(*) | Total clock-in events | Aggregate |
| `tardiness_minutes > 0` | Tardy count | Aggregate |
| `tardiness_minutes = 0` | On-time count | Aggregate |
| on_time / total | Punctuality rate | Ratio |
| AVG(`tardiness_minutes`) WHERE > 0 | Average tardiness (when late) | Average |
| MAX(`tardiness_minutes`) | Worst tardiness | Extreme |
| `clock_in_at` to `clock_out_at` duration | Actual hours worked per clock event | Calculated |
| SUM actual hours by `employee_id` | Total hours worked per driver | Per-driver metric |
| Actual hours vs scheduled hours (joined with shifts) | Schedule adherence rate | Ratio |
| `event_date` with no matching clock_event for a shift | Missed shifts (no-clock-in) | Aggregate |
| `tardiness_minutes` distribution buckets | Tardiness distribution (on-time, 1-5m, 6-15m, etc.) | Distribution |
| By `employee_id` | All above metrics per driver | Per-driver breakdown |
| By DOW | Tardiness patterns by day of week | Distribution |

### 1.10 `tenant_settings`

| Key | Relevance to Analytics |
|---|---|
| `service_hours_start`, `service_hours_end` | Defines operating window for peak-hours analysis |
| `operating_days` | Defines valid weekdays for shift coverage |
| `grace_period_minutes` | Context for no-show metrics |
| `max_no_show_strikes` | Threshold for rider termination cohort |
| `tardy_threshold_minutes` | Threshold for punctuality classification |

### 1.11 `notifications` (Low analytical value)

| Column(s) | Computable Metric | Type |
|---|---|---|
| COUNT by `event_type` | Notification volume by type | Distribution |
| `read` = false count | Unread notification backlog | Snapshot |

### 1.12 `program_content` -- No analytical metrics.

---

## 2. Computable Metrics Catalog

Organized by domain. Each metric has an ID for cross-referencing in endpoint and export specifications.

### 2.1 Ride Operations

| ID | Metric Name | Formula | Tables |
|---|---|---|---|
| R1 | Total Rides | `COUNT(*) FROM rides` | rides |
| R2 | Completed Rides | `COUNT(*) FILTER (WHERE status='completed')` | rides |
| R3 | No-Show Count | `COUNT(*) FILTER (WHERE status='no_show')` | rides |
| R4 | Cancelled Count | `COUNT(*) FILTER (WHERE status='cancelled')` | rides |
| R5 | Denied Count | `COUNT(*) FILTER (WHERE status='denied')` | rides |
| R6 | Active Rides | `COUNT(*) FILTER (WHERE status IN active statuses)` | rides |
| R7 | Completion Rate | `R2 / R1 * 100` | rides |
| R8 | No-Show Rate | `R3 / R1 * 100` | rides |
| R9 | Cancellation Rate | `R4 / R1 * 100` | rides |
| R10 | Denial Rate | `R5 / R1 * 100` | rides |
| R11 | Rides Per Day | `COUNT(*) GROUP BY DATE(requested_time)` | rides |
| R12 | Rides Per Hour | `COUNT(*) GROUP BY HOUR(requested_time)` | rides |
| R13 | Rides Per DOW | `COUNT(*) GROUP BY DOW(requested_time)` | rides |
| R14 | Peak Hours Heatmap | `COUNT(*) GROUP BY DOW, HOUR` | rides |
| R15 | Top Routes | `COUNT(*) GROUP BY pickup, dropoff ORDER BY count DESC` | rides |
| R16 | Route Completion Rate | `completed/total GROUP BY pickup, dropoff` | rides |
| R17 | Unique Riders | `COUNT(DISTINCT rider_email)` | rides |
| R18 | People Helped | `COUNT(DISTINCT rider_email) FILTER (WHERE completed)` | rides |
| R19 | Recurring Ride Ratio | `COUNT(WHERE recurring_id IS NOT NULL) / R1` | rides |
| R20 | Cancellation By Source | `COUNT GROUP BY cancelled_by IS NULL vs NOT NULL` | rides |
| R21 | Advance Booking Lead | `AVG(requested_time - created_at)` | rides |

### 2.2 Driver Performance

| ID | Metric Name | Formula | Tables |
|---|---|---|---|
| D1 | Rides Completed Per Driver | `COUNT(*) FILTER (completed) GROUP BY assigned_driver_id` | rides, users |
| D2 | No-Shows Per Driver | `COUNT(*) FILTER (no_show) GROUP BY assigned_driver_id` | rides, users |
| D3 | Driver Completion Rate | `D1 / (D1 + D2) * 100` per driver | rides, users |
| D4 | Shifts Worked | `COUNT(DISTINCT event_date) GROUP BY employee_id` | clock_events |
| D5 | Punctuality Rate | `on_time_count / total_clock_ins * 100` per driver | clock_events |
| D6 | Avg Tardiness | `AVG(tardiness_minutes) FILTER (> 0)` per driver | clock_events |
| D7 | Missed Shifts | Scheduled shifts with no matching clock_event | shifts, clock_events |
| D8 | Total Hours Worked | `SUM(clock_out_at - clock_in_at)` per driver | clock_events |
| D9 | Active Ride Time | Time between 'claimed' event and 'completed'/'no_show' event per ride | ride_events, rides |
| D10 | Utilization Rate | `D9 / D8 * 100` (active ride time / total clocked hours) | rides, ride_events, clock_events |

### 2.3 Rider Analytics

| ID | Metric Name | Formula | Tables |
|---|---|---|---|
| RI1 | Active Riders | Riders with >= 1 ride in date range | rides |
| RI2 | New Riders | Riders whose first-ever ride falls in date range | rides |
| RI3 | Returning Riders | Active riders minus new riders | rides |
| RI4 | At-Risk Riders | `count = max_no_show_strikes - 1` | rider_miss_counts, tenant_settings |
| RI5 | Terminated Riders | `count >= max_no_show_strikes` | rider_miss_counts, tenant_settings |
| RI6 | Churned Riders | Had rides before the date range but none during | rides |
| RI7 | No-Show Rate Per Rider | `no_show_count / total_count` per rider_email | rides |
| RI8 | Strike Distribution | Histogram of rider_miss_counts.count | rider_miss_counts |
| RI9 | Top Riders By Volume | Riders ranked by ride count | rides |
| RI10 | Recurring Ride Users | Riders with active recurring_rides | recurring_rides |
| RI11 | Rider Retention Rate | `(active this period who were also active last period) / active last period` | rides |

### 2.4 Fleet & Vehicles

| ID | Metric Name | Formula | Tables |
|---|---|---|---|
| F1 | Fleet Size | `COUNT(*) WHERE status != 'retired'` | vehicles |
| F2 | Fleet Available | `COUNT(*) WHERE status = 'available'` | vehicles |
| F3 | Fleet Composition | Count by type (standard/accessible) | vehicles |
| F4 | Rides Per Vehicle | `COUNT(*) GROUP BY vehicle_id` | rides |
| F5 | Standard vs Accessible Demand | Ride count joined on vehicle.type | rides, vehicles |
| F6 | Maintenance Events Per Vehicle | `COUNT(*) GROUP BY vehicle_id` | maintenance_logs |
| F7 | Maintenance Overdue Count | Vehicles where last_maintenance_date > 30 days ago | vehicles |
| F8 | Fleet Mileage | `SUM(total_miles)` | vehicles |
| F9 | Miles Between Maintenance | Delta of mileage_at_service between events | maintenance_logs |
| F10 | Vehicle Last Used | `MAX(requested_time) WHERE completed GROUP BY vehicle_id` | rides |

### 2.5 Shift Coverage & Operations

| ID | Metric Name | Formula | Tables |
|---|---|---|---|
| S1 | Scheduled Driver-Hours | `SUM(end_time - start_time)` from shifts in date range | shifts |
| S2 | Actual Clocked Hours | `SUM(clock_out_at - clock_in_at)` from clock_events | clock_events |
| S3 | Coverage Rate | `S2 / S1 * 100` | shifts, clock_events |
| S4 | Coverage Gap | `S1 - S2` (understaffed hours) | shifts, clock_events |
| S5 | Missed Shift Count | Scheduled days with no clock_event | shifts, clock_events |
| S6 | Overstaffed Periods | Hours where clocked drivers > rides in queue | clock_events, rides |
| S7 | Driver-Hours Per Day | `S2 GROUP BY event_date` | clock_events |
| S8 | Rides Per Driver-Hour | `completed_rides / S2` | rides, clock_events |

---

## 3. Existing Endpoints (Reference)

These endpoints are already implemented in `server.js`. The new endpoints below supplement them. Where overlap exists, the new endpoints provide more granular or differently-structured data.

| Endpoint | Metrics Covered | Date Filter |
|---|---|---|
| `GET /api/analytics/summary` | R1-R10, R17, R18 | `?from=&to=` on `requested_time` |
| `GET /api/analytics/hotspots` | R15 (top 10), OD matrix (top 50) | `?from=&to=` |
| `GET /api/analytics/frequency` | R11, R12, R13, RI9, D1, status breakdown | `?from=&to=` |
| `GET /api/analytics/vehicles` | F4, F7, F10 | `?from=&to=` |
| `GET /api/analytics/milestones` | Milestone badges (cumulative, no date filter) | None |
| `GET /api/analytics/semester-report` | Semester comparison, monthly breakdown | Auto-detected |
| `GET /api/analytics/tardiness` | D4-D7, tardiness distribution, daily trend, DOW | `?from=&to=` on `event_date` |

---

## 4. New API Endpoint Specifications

All new endpoints require `requireOffice` middleware (office role only). All support `?from=&to=` query parameters as ISO date strings (e.g., `2026-02-01`). When omitted, defaults to last 7 days.

### 4.1 `GET /api/analytics/ride-volume`

**Purpose:** Rides per day with completion/denial/cancellation rates. Powers the daily volume line chart and rate trend chart.

**Query params:** `?from=&to=&granularity=day|week|month` (default: `day`)

**SQL strategy:**

```sql
-- Daily granularity (default)
SELECT
  DATE(requested_time) AS date,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  COUNT(*) FILTER (WHERE status = 'denied') AS denied,
  COUNT(DISTINCT rider_email) AS unique_riders
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
GROUP BY DATE(requested_time)
ORDER BY date;

-- Weekly granularity
-- Replace DATE(requested_time) with DATE_TRUNC('week', requested_time)::date

-- Monthly granularity
-- Replace DATE(requested_time) with DATE_TRUNC('month', requested_time)::date
```

**Response JSON:**

```json
{
  "granularity": "day",
  "data": [
    {
      "date": "2026-02-21",
      "total": 12,
      "completed": 10,
      "noShows": 1,
      "cancelled": 1,
      "denied": 0,
      "uniqueRiders": 8,
      "completionRate": 83.3,
      "noShowRate": 8.3,
      "cancellationRate": 8.3,
      "denialRate": 0.0
    }
  ],
  "totals": {
    "total": 84,
    "completed": 70,
    "noShows": 6,
    "cancelled": 5,
    "denied": 3,
    "completionRate": 83.3,
    "noShowRate": 7.1,
    "cancellationRate": 6.0,
    "denialRate": 3.6
  }
}
```

---

### 4.2 `GET /api/analytics/ride-outcomes`

**Purpose:** Status outcome distribution and trend over time. Shows completed vs no_show vs cancelled vs denied with weekly trend.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Overall outcome counts
SELECT
  status,
  COUNT(*) AS count
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
  AND status IN ('completed', 'no_show', 'cancelled', 'denied')
GROUP BY status;

-- Weekly trend of terminal statuses
SELECT
  DATE_TRUNC('week', requested_time)::date AS week_start,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  COUNT(*) FILTER (WHERE status = 'denied') AS denied
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
  AND status IN ('completed', 'no_show', 'cancelled', 'denied')
GROUP BY week_start
ORDER BY week_start;
```

**Response JSON:**

```json
{
  "distribution": {
    "completed": 70,
    "noShows": 6,
    "cancelled": 5,
    "denied": 3
  },
  "weeklyTrend": [
    {
      "weekStart": "2026-02-17",
      "completed": 35,
      "noShows": 3,
      "cancelled": 2,
      "denied": 2
    }
  ]
}
```

---

### 4.3 `GET /api/analytics/peak-hours`

**Purpose:** Hour-of-day by day-of-week heatmap grid (Mon-Fri x operating hours). Shows which time slots have highest ride volume.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Heatmap grid: DOW (ISODOW 1=Mon..5=Fri) x HOUR (8..18)
SELECT
  (EXTRACT(ISODOW FROM requested_time)::int) AS dow,
  EXTRACT(HOUR FROM requested_time)::int AS hour,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
  AND EXTRACT(ISODOW FROM requested_time) BETWEEN 1 AND 5
  AND EXTRACT(HOUR FROM requested_time) BETWEEN 8 AND 18
GROUP BY dow, hour
ORDER BY dow, hour;
```

**Note:** Uses ISODOW (1=Monday) for consistent Monday-Friday grid, unlike existing frequency endpoint which uses DOW (0=Sunday). The frontend will need to map accordingly.

**Response JSON:**

```json
{
  "grid": [
    { "dow": 1, "hour": 8, "total": 5, "completed": 4, "noShows": 1 },
    { "dow": 1, "hour": 9, "total": 8, "completed": 7, "noShows": 0 }
  ],
  "maxCount": 15,
  "operatingHours": { "start": 8, "end": 19 },
  "operatingDays": [1, 2, 3, 4, 5]
}
```

`operatingHours` and `operatingDays` are read from `tenant_settings` to let the frontend render the grid correctly.

---

### 4.4 `GET /api/analytics/routes`

**Purpose:** Top 20 routes by frequency with per-route completion rate. More detailed than `/hotspots` which only returns top 10.

**Query params:** `?from=&to=&limit=20`

**SQL strategy:**

```sql
SELECT
  pickup_location,
  dropoff_location,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled,
  COUNT(*) FILTER (WHERE status = 'denied') AS denied,
  COUNT(DISTINCT rider_email) AS unique_riders,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) AS completion_rate
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
  AND status NOT IN ('pending', 'approved', 'scheduled', 'driver_on_the_way', 'driver_arrived_grace')
GROUP BY pickup_location, dropoff_location
ORDER BY total DESC
LIMIT $3;
```

**Response JSON:**

```json
{
  "routes": [
    {
      "pickupLocation": "Residence Hall A",
      "dropoffLocation": "Main Library",
      "total": 28,
      "completed": 25,
      "noShows": 2,
      "cancelled": 1,
      "denied": 0,
      "uniqueRiders": 6,
      "completionRate": 89.3
    }
  ]
}
```

---

### 4.5 `GET /api/analytics/driver-performance`

**Purpose:** Per-driver composite scorecard: rides completed, no-shows attributed, tardiness, shifts worked, clock-in adherence.

**Query params:** `?from=&to=`

**SQL strategy (3 parallel queries, joined in application code):**

```sql
-- Query 1: Ride stats per driver
SELECT
  r.assigned_driver_id AS driver_id,
  u.name AS driver_name,
  COUNT(*) AS total_rides,
  COUNT(*) FILTER (WHERE r.status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE r.status = 'no_show') AS no_shows,
  COUNT(DISTINCT DATE(r.requested_time)) AS active_days
FROM rides r
JOIN users u ON r.assigned_driver_id = u.id
WHERE r.assigned_driver_id IS NOT NULL
  AND r.requested_time >= $1 AND r.requested_time <= $2
GROUP BY r.assigned_driver_id, u.name;

-- Query 2: Clock-in stats per driver
SELECT
  ce.employee_id AS driver_id,
  COUNT(*) AS total_clock_ins,
  COUNT(*) FILTER (WHERE ce.tardiness_minutes = 0 OR ce.tardiness_minutes IS NULL) AS on_time,
  COUNT(*) FILTER (WHERE ce.tardiness_minutes > 0) AS tardy,
  COALESCE(ROUND(AVG(ce.tardiness_minutes) FILTER (WHERE ce.tardiness_minutes > 0)), 0) AS avg_tardiness_min,
  COALESCE(MAX(ce.tardiness_minutes), 0) AS max_tardiness_min,
  ROUND(EXTRACT(EPOCH FROM SUM(ce.clock_out_at - ce.clock_in_at)) / 3600.0, 1) AS total_hours_worked
FROM clock_events ce
WHERE ce.event_date >= $1::date AND ce.event_date <= $2::date
  AND ce.clock_out_at IS NOT NULL
GROUP BY ce.employee_id;

-- Query 3: Missed shifts per driver (shifts with no clock_event in range)
WITH date_range AS (
  SELECT generate_series($1::date, $2::date, '1 day'::interval)::date AS d
),
scheduled AS (
  SELECT s.employee_id, dr.d AS shift_date
  FROM shifts s
  JOIN date_range dr ON (EXTRACT(ISODOW FROM dr.d)::int - 1) = s.day_of_week
  WHERE (s.week_start IS NULL OR s.week_start = (
    dr.d - ((EXTRACT(ISODOW FROM dr.d)::int - 1) || ' days')::interval
  )::date)
),
clocked AS (
  SELECT employee_id, event_date FROM clock_events
)
SELECT s.employee_id AS driver_id,
       COUNT(*) AS missed_shifts
FROM scheduled s
LEFT JOIN clocked c ON c.employee_id = s.employee_id AND c.event_date = s.shift_date
WHERE c.employee_id IS NULL
  AND s.shift_date <= CURRENT_DATE
GROUP BY s.employee_id;
```

**Application logic:** Merge the three result sets by `driver_id`.

**Response JSON:**

```json
{
  "drivers": [
    {
      "driverId": "emp1",
      "driverName": "Alex",
      "totalRides": 35,
      "completed": 32,
      "noShows": 3,
      "completionRate": 91.4,
      "activeDays": 18,
      "totalClockIns": 20,
      "onTime": 17,
      "tardy": 3,
      "punctualityRate": 85.0,
      "avgTardinessMin": 7,
      "maxTardinessMin": 15,
      "totalHoursWorked": 80.5,
      "missedShifts": 1,
      "ridesPerHour": 0.4
    }
  ]
}
```

**`ridesPerHour`** = `completed / totalHoursWorked` -- key productivity metric.

---

### 4.6 `GET /api/analytics/driver-utilization`

**Purpose:** Per-driver percentage of shift time spent actively handling rides vs idle. Requires correlating ride lifecycle events with clock-in periods.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Step 1: Get driver clocked-in periods
SELECT
  employee_id,
  event_date,
  clock_in_at,
  clock_out_at,
  EXTRACT(EPOCH FROM (clock_out_at - clock_in_at)) AS shift_seconds
FROM clock_events
WHERE event_date >= $1::date AND event_date <= $2::date
  AND clock_out_at IS NOT NULL;

-- Step 2: For each driver, get ride durations (claimed -> completed/no_show)
-- "Active ride time" = time between the 'claimed' ride_event and the terminal event
SELECT
  r.assigned_driver_id AS driver_id,
  r.id AS ride_id,
  claimed.at AS claimed_at,
  COALESCE(terminal.at, r.updated_at) AS terminal_at,
  EXTRACT(EPOCH FROM (COALESCE(terminal.at, r.updated_at) - claimed.at)) AS ride_seconds
FROM rides r
JOIN ride_events claimed ON claimed.ride_id = r.id AND claimed.type = 'claimed'
LEFT JOIN ride_events terminal ON terminal.ride_id = r.id AND terminal.type IN ('completed', 'no_show')
WHERE r.assigned_driver_id IS NOT NULL
  AND r.requested_time >= $1 AND r.requested_time <= $2
  AND r.status IN ('completed', 'no_show');
```

**Application logic:**

1. Sum `shift_seconds` per driver = total clocked time.
2. Sum `ride_seconds` per driver = total active ride time.
3. `utilization_rate = (active_ride_time / total_clocked_time) * 100`

**Response JSON:**

```json
{
  "drivers": [
    {
      "driverId": "emp1",
      "driverName": "Alex",
      "totalClockedHours": 80.5,
      "activeRideHours": 32.2,
      "idleHours": 48.3,
      "utilizationRate": 40.0,
      "ridesHandled": 32,
      "avgRideDurationMin": 12.5
    }
  ],
  "overall": {
    "totalClockedHours": 280.0,
    "activeRideHours": 112.0,
    "utilizationRate": 40.0
  }
}
```

**Important note:** The `ride_events` table stores a timestamp for 'claimed' and 'completed'/'no_show' types. If the demo-seed generates events with 3-minute increments between statuses (as observed in `demo-seed.js`), the ride duration will be artificial. For real data, the timestamps reflect actual ride lifecycle timing. The endpoint works correctly with either.

---

### 4.7 `GET /api/analytics/rider-cohorts`

**Purpose:** Classify riders into cohorts: Active, New, Returning, At-Risk, Churned, Terminated.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Active riders in date range with their first-ever ride date
WITH period_riders AS (
  SELECT
    rider_email,
    rider_name,
    COUNT(*) AS rides_in_period,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_in_period,
    COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows_in_period
  FROM rides
  WHERE requested_time >= $1 AND requested_time <= $2
  GROUP BY rider_email, rider_name
),
all_time_first AS (
  SELECT
    rider_email,
    MIN(requested_time) AS first_ride_ever,
    MAX(requested_time) AS last_ride_ever
  FROM rides
  GROUP BY rider_email
),
previous_period AS (
  SELECT DISTINCT rider_email
  FROM rides
  WHERE requested_time < $1
    AND requested_time >= ($1::date - ($2::date - $1::date))
)
SELECT
  pr.rider_email,
  pr.rider_name,
  pr.rides_in_period,
  pr.completed_in_period,
  pr.no_shows_in_period,
  atf.first_ride_ever,
  atf.last_ride_ever,
  CASE
    WHEN atf.first_ride_ever >= $1 THEN 'new'
    WHEN pp.rider_email IS NOT NULL THEN 'returning'
    ELSE 'reactivated'
  END AS cohort
FROM period_riders pr
JOIN all_time_first atf ON atf.rider_email = pr.rider_email
LEFT JOIN previous_period pp ON pp.rider_email = pr.rider_email;

-- Churned riders: had rides before period but none during
SELECT
  rider_email,
  rider_name,
  MAX(requested_time) AS last_ride
FROM rides
WHERE rider_email NOT IN (
  SELECT rider_email FROM rides
  WHERE requested_time >= $1 AND requested_time <= $2
)
AND requested_time < $1
GROUP BY rider_email, rider_name;

-- At-risk and terminated from rider_miss_counts
SELECT rmc.email, rmc.count AS strike_count
FROM rider_miss_counts rmc;
```

**Application logic:** Merge query results. Read `max_no_show_strikes` from tenant_settings to classify at-risk vs terminated.

**Response JSON:**

```json
{
  "summary": {
    "active": 15,
    "new": 3,
    "returning": 10,
    "reactivated": 2,
    "churned": 5,
    "atRisk": 2,
    "terminated": 1
  },
  "cohorts": {
    "active": [
      {
        "riderEmail": "casey@campus.edu",
        "riderName": "Casey Rivera",
        "ridesInPeriod": 8,
        "completedInPeriod": 7,
        "noShowsInPeriod": 1,
        "firstRideEver": "2025-09-15T10:00:00Z",
        "cohort": "returning"
      }
    ],
    "churned": [
      {
        "riderEmail": "old.rider@campus.edu",
        "riderName": "Old Rider",
        "lastRide": "2025-11-20T14:00:00Z"
      }
    ],
    "atRisk": [
      {
        "email": "risky@campus.edu",
        "strikeCount": 4,
        "maxStrikes": 5
      }
    ],
    "terminated": [
      {
        "email": "terminated@campus.edu",
        "strikeCount": 5
      }
    ]
  },
  "retentionRate": 66.7
}
```

**`retentionRate`** = `returning / (returning + churned) * 100` -- riders from the previous equivalent period who are still active.

---

### 4.8 `GET /api/analytics/rider-no-shows`

**Purpose:** No-show analysis: rate by rider, strike count distribution histogram, repeat offender list.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- No-show rate per rider
SELECT
  rider_email,
  rider_name,
  COUNT(*) AS total_rides,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  COUNT(*) FILTER (WHERE status = 'no_show') AS no_shows,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'no_show') * 100.0
    / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'no_show')), 0),
    1
  ) AS no_show_rate
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2
GROUP BY rider_email, rider_name
HAVING COUNT(*) FILTER (WHERE status = 'no_show') > 0
ORDER BY no_shows DESC;

-- Current strike distribution from rider_miss_counts
SELECT
  count AS strikes,
  COUNT(*) AS rider_count
FROM rider_miss_counts
GROUP BY count
ORDER BY count;

-- Overall no-show stats for the period
SELECT
  COUNT(*) FILTER (WHERE status = 'no_show') AS total_no_shows,
  COUNT(*) FILTER (WHERE status IN ('completed', 'no_show')) AS total_fulfilled,
  COUNT(DISTINCT rider_email) FILTER (WHERE status = 'no_show') AS riders_with_no_shows
FROM rides
WHERE requested_time >= $1 AND requested_time <= $2;
```

**Response JSON:**

```json
{
  "summary": {
    "totalNoShows": 6,
    "totalFulfilled": 76,
    "noShowRate": 7.9,
    "ridersWithNoShows": 4
  },
  "byRider": [
    {
      "riderEmail": "dana.patel@campus.edu",
      "riderName": "Dana Patel",
      "totalRides": 10,
      "completed": 8,
      "noShows": 2,
      "noShowRate": 20.0
    }
  ],
  "strikeDistribution": [
    { "strikes": 0, "riderCount": 45 },
    { "strikes": 1, "riderCount": 8 },
    { "strikes": 2, "riderCount": 3 },
    { "strikes": 3, "riderCount": 1 },
    { "strikes": 4, "riderCount": 1 },
    { "strikes": 5, "riderCount": 0 }
  ]
}
```

---

### 4.9 `GET /api/analytics/fleet-utilization`

**Purpose:** Per-vehicle ride count, maintenance history, current status. Richer than `/analytics/vehicles` with maintenance detail.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Ride stats per vehicle
SELECT
  v.id,
  v.name,
  v.type,
  v.status,
  v.total_miles,
  v.last_maintenance_date,
  COUNT(r.id) AS total_rides,
  COUNT(r.id) FILTER (WHERE r.status = 'completed') AS completed_rides,
  MAX(r.requested_time) AS last_used
FROM vehicles v
LEFT JOIN rides r ON r.vehicle_id = v.id
  AND r.requested_time >= $1 AND r.requested_time <= $2
GROUP BY v.id, v.name, v.type, v.status, v.total_miles, v.last_maintenance_date
ORDER BY total_rides DESC;

-- Maintenance events per vehicle in period
SELECT
  ml.vehicle_id,
  COUNT(*) AS maintenance_count,
  MAX(ml.service_date) AS last_service,
  MAX(ml.mileage_at_service) AS latest_mileage
FROM maintenance_logs ml
WHERE ml.service_date >= $1::date AND ml.service_date <= $2::date
GROUP BY ml.vehicle_id;
```

**Response JSON:**

```json
{
  "vehicles": [
    {
      "id": "veh_cart1",
      "name": "Cart 1",
      "type": "standard",
      "status": "available",
      "totalMiles": 1250,
      "totalRides": 28,
      "completedRides": 25,
      "lastUsed": "2026-02-27T15:00:00Z",
      "maintenanceCount": 2,
      "lastMaintenanceDate": "2026-02-15",
      "daysSinceMaintenance": 13,
      "maintenanceOverdue": false
    }
  ],
  "summary": {
    "totalFleet": 4,
    "available": 3,
    "retired": 1,
    "standardCount": 3,
    "accessibleCount": 1,
    "totalMiles": 5200,
    "overdueCount": 0
  }
}
```

---

### 4.10 `GET /api/analytics/vehicle-demand`

**Purpose:** Standard vs accessible vehicle demand ratio and trend. Helps plan fleet composition.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Demand by vehicle type
SELECT
  COALESCE(v.type, 'unassigned') AS vehicle_type,
  COUNT(*) AS total_rides,
  COUNT(*) FILTER (WHERE r.status = 'completed') AS completed
FROM rides r
LEFT JOIN vehicles v ON r.vehicle_id = v.id
WHERE r.requested_time >= $1 AND r.requested_time <= $2
  AND r.status NOT IN ('denied', 'cancelled')
GROUP BY COALESCE(v.type, 'unassigned');

-- Weekly trend by vehicle type
SELECT
  DATE_TRUNC('week', r.requested_time)::date AS week_start,
  COALESCE(v.type, 'unassigned') AS vehicle_type,
  COUNT(*) AS count
FROM rides r
LEFT JOIN vehicles v ON r.vehicle_id = v.id
WHERE r.requested_time >= $1 AND r.requested_time <= $2
  AND r.status NOT IN ('denied', 'cancelled')
GROUP BY week_start, vehicle_type
ORDER BY week_start, vehicle_type;
```

**Response JSON:**

```json
{
  "demand": {
    "standard": { "totalRides": 65, "completed": 58 },
    "accessible": { "totalRides": 12, "completed": 10 },
    "unassigned": { "totalRides": 7, "completed": 2 }
  },
  "accessibleRatio": 15.6,
  "weeklyTrend": [
    {
      "weekStart": "2026-02-17",
      "standard": 33,
      "accessible": 6,
      "unassigned": 3
    }
  ]
}
```

---

### 4.11 `GET /api/analytics/shift-coverage`

**Purpose:** Scheduled driver-hours vs actual clocked hours, day-by-day gap analysis. Identifies understaffing.

**Query params:** `?from=&to=`

**SQL strategy:**

```sql
-- Step 1: Generate date series for the range
WITH date_range AS (
  SELECT generate_series($1::date, LEAST($2::date, CURRENT_DATE), '1 day'::interval)::date AS d
),

-- Step 2: Scheduled hours per day (join shifts to dates by day_of_week)
scheduled AS (
  SELECT
    dr.d AS day,
    SUM(
      EXTRACT(EPOCH FROM (s.end_time - s.start_time)) / 3600.0
    ) AS scheduled_hours,
    COUNT(DISTINCT s.employee_id) AS scheduled_drivers
  FROM date_range dr
  JOIN shifts s ON (EXTRACT(ISODOW FROM dr.d)::int - 1) = s.day_of_week
    AND (s.week_start IS NULL OR s.week_start = (
      dr.d - ((EXTRACT(ISODOW FROM dr.d)::int - 1) || ' days')::interval
    )::date)
  WHERE EXTRACT(ISODOW FROM dr.d) BETWEEN 1 AND 5
  GROUP BY dr.d
),

-- Step 3: Actual hours per day
actual AS (
  SELECT
    ce.event_date AS day,
    SUM(
      EXTRACT(EPOCH FROM (ce.clock_out_at - ce.clock_in_at)) / 3600.0
    ) AS actual_hours,
    COUNT(DISTINCT ce.employee_id) AS actual_drivers
  FROM clock_events ce
  WHERE ce.event_date >= $1::date AND ce.event_date <= $2::date
    AND ce.clock_out_at IS NOT NULL
  GROUP BY ce.event_date
),

-- Step 4: Rides completed per day (for rides-per-driver-hour)
daily_rides AS (
  SELECT
    DATE(requested_time) AS day,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed
  FROM rides
  WHERE requested_time >= $1 AND requested_time <= $2
  GROUP BY DATE(requested_time)
)

SELECT
  s.day,
  ROUND(COALESCE(s.scheduled_hours, 0)::numeric, 1) AS scheduled_hours,
  ROUND(COALESCE(a.actual_hours, 0)::numeric, 1) AS actual_hours,
  ROUND(COALESCE(a.actual_hours, 0) - COALESCE(s.scheduled_hours, 0), 1) AS gap_hours,
  COALESCE(s.scheduled_drivers, 0) AS scheduled_drivers,
  COALESCE(a.actual_drivers, 0) AS actual_drivers,
  COALESCE(dr.completed, 0) AS completed_rides
FROM scheduled s
LEFT JOIN actual a ON a.day = s.day
LEFT JOIN daily_rides dr ON dr.day = s.day
ORDER BY s.day;
```

**Response JSON:**

```json
{
  "daily": [
    {
      "date": "2026-02-24",
      "scheduledHours": 24.0,
      "actualHours": 22.5,
      "gapHours": -1.5,
      "scheduledDrivers": 4,
      "actualDrivers": 3,
      "completedRides": 8,
      "ridesPerDriverHour": 0.36
    }
  ],
  "totals": {
    "scheduledHours": 120.0,
    "actualHours": 112.5,
    "gapHours": -7.5,
    "coverageRate": 93.8,
    "totalCompletedRides": 42,
    "avgRidesPerDriverHour": 0.37
  }
}
```

`gapHours` negative = understaffed; positive = overtime. `coverageRate = actualHours / scheduledHours * 100`.

---

### 4.12 `GET /api/analytics/export-report`

**Purpose:** Generate a multi-sheet Excel workbook (.xlsx) with all analytics data for the specified date range.

**Query params:** `?from=&to=`

**Response:** Binary `.xlsx` file download (`Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `Content-Disposition: attachment; filename="rideops-report-YYYY-MM-DD.xlsx"`)

**Dependency:** `exceljs` (npm package, server-side only)

**Implementation approach:** Call the same query functions used by the other analytics endpoints internally, then format into Excel sheets. See Section 5 for the sheet-by-sheet schema.

---

## 5. Excel Report Schema

The workbook contains 8 sheets. All data sources are the same queries used by the API endpoints above, parameterized by `?from=&to=`.

### 5.1 Sheet: "Summary"

| Column | Data Type | Source |
|---|---|---|
| Metric | String | Label |
| Value | Number/String | From /summary + /ride-volume totals |

Rows (key-value pairs):
- Report Period: `{from} to {to}`
- Total Rides: R1
- Completed Rides: R2
- Completion Rate: R7 (formatted as %)
- No-Shows: R3
- No-Show Rate: R8 (formatted as %)
- Cancellations: R4
- Cancellation Rate: R9 (formatted as %)
- Denied: R5
- Denial Rate: R10 (formatted as %)
- Unique Riders: R17
- People Helped: R18
- Active Drivers: unique assigned_driver_id count
- Fleet Availability: F2 / F1

**Conditional formatting:**
- Completion Rate: green >= 85%, yellow 70-84%, red < 70%
- No-Show Rate: green <= 5%, yellow 6-15%, red > 15%

### 5.2 Sheet: "Daily Volume"

| Column | Type | Source |
|---|---|---|
| Date | Date | `DATE(requested_time)` |
| Day | String | Day-of-week name |
| Total Rides | Integer | R11 |
| Completed | Integer | Per-day completed count |
| No-Shows | Integer | Per-day no_show count |
| Cancelled | Integer | Per-day cancelled count |
| Denied | Integer | Per-day denied count |
| Completion Rate | Percentage | completed/total |
| Unique Riders | Integer | Per-day distinct rider_email |

**Sort order:** Date ascending.

**Conditional formatting:**
- Completion Rate column: green >= 85%, yellow 70-84%, red < 70%

### 5.3 Sheet: "Routes"

| Column | Type | Source |
|---|---|---|
| Pickup Location | String | `pickup_location` |
| Dropoff Location | String | `dropoff_location` |
| Total Rides | Integer | Route count |
| Completed | Integer | Per-route completed |
| No-Shows | Integer | Per-route no_show |
| Completion Rate | Percentage | completed / total |
| Unique Riders | Integer | Per-route distinct rider_email |

**Sort order:** Total Rides descending.

**Conditional formatting:**
- Completion Rate: green >= 85%, yellow 70-84%, red < 70%

### 5.4 Sheet: "Driver Performance"

| Column | Type | Source |
|---|---|---|
| Driver Name | String | `users.name` |
| Total Rides | Integer | D1 total |
| Completed | Integer | D1 |
| No-Shows | Integer | D2 |
| Completion Rate | Percentage | D3 |
| Clock-Ins | Integer | D4 |
| On-Time | Integer | on_time count |
| Tardy | Integer | tardy count |
| Punctuality Rate | Percentage | D5 |
| Avg Tardiness (min) | Number (1 decimal) | D6 |
| Max Tardiness (min) | Integer | max_tardiness |
| Missed Shifts | Integer | D7 |
| Hours Worked | Number (1 decimal) | D8 |
| Rides/Hour | Number (2 decimal) | completed / hours_worked |

**Sort order:** Completed rides descending.

**Conditional formatting:**
- Punctuality Rate: green >= 90%, yellow 80-89%, red < 80%
- Missed Shifts: red if > 0

### 5.5 Sheet: "Rider Analysis"

| Column | Type | Source |
|---|---|---|
| Rider Name | String | `rider_name` |
| Rider Email | String | `rider_email` |
| Total Rides | Integer | Per-rider count |
| Completed | Integer | Per-rider completed |
| No-Shows | Integer | Per-rider no_show |
| No-Show Rate | Percentage | no_show / total |
| Current Strikes | Integer | `rider_miss_counts.count` |
| Cohort | String | new/returning/reactivated |
| First Ride | Date | `MIN(requested_time)` |
| Last Ride | Date | `MAX(requested_time)` |

**Sort order:** Total Rides descending.

**Conditional formatting:**
- No-Show Rate: red if > 20%
- Current Strikes: yellow if = max_strikes - 1, red if >= max_strikes

### 5.6 Sheet: "Fleet"

| Column | Type | Source |
|---|---|---|
| Vehicle Name | String | `vehicles.name` |
| Type | String | standard/accessible |
| Status | String | available/in_use/retired |
| Total Miles | Number | `total_miles` |
| Rides (Period) | Integer | Per-vehicle ride count in range |
| Completed Rides | Integer | Per-vehicle completed in range |
| Last Used | Date | MAX requested_time for completed rides |
| Maintenance Events | Integer | maintenance_logs count in range |
| Last Maintenance | Date | `last_maintenance_date` |
| Days Since Maintenance | Integer | CURRENT_DATE - last_maintenance_date |

**Sort order:** Rides descending, retired vehicles last.

**Conditional formatting:**
- Days Since Maintenance: yellow >= 20, red >= 30
- Status "retired": gray row background

### 5.7 Sheet: "Shift Coverage"

| Column | Type | Source |
|---|---|---|
| Date | Date | Day |
| Day | String | Day-of-week name |
| Scheduled Hours | Number (1 decimal) | S1 per day |
| Actual Hours | Number (1 decimal) | S2 per day |
| Gap Hours | Number (1 decimal) | S4 per day (negative = understaffed) |
| Coverage Rate | Percentage | actual / scheduled |
| Scheduled Drivers | Integer | Per day |
| Actual Drivers | Integer | Per day |
| Completed Rides | Integer | Per day |
| Rides/Driver-Hour | Number (2 decimal) | completed / actual_hours |

**Sort order:** Date ascending.

**Conditional formatting:**
- Coverage Rate: green >= 95%, yellow 80-94%, red < 80%
- Gap Hours: red if negative

### 5.8 Sheet: "Peak Hours"

This is a matrix (heatmap) sheet.

**Layout:** Rows = hours (8:00 through 18:00), Columns = Mon through Fri.

| | Monday | Tuesday | Wednesday | Thursday | Friday |
|---|---|---|---|---|---|
| 8:00 | 5 | 3 | 7 | 4 | 2 |
| 9:00 | 8 | 10 | 9 | 7 | 6 |
| ... | | | | | |

**Data source:** Peak hours heatmap grid (R14).

**Conditional formatting:** Cell background gradient from white (0 rides) to the tenant's primary color (max rides). Use Excel's built-in color scale formatting.

---

## 6. Dashboard Layout

The analytics panel already has 5 sub-tabs: Dashboard, Hotspots, Milestones, Reports, Attendance. The new endpoints enhance the existing Dashboard sub-tab and add depth to Reports.

### 6.1 KPI Cards (Top Bar)

Replace the current 7-card KPI bar with 6 focused cards (no wait-time metrics):

| Position | KPI | Metric ID | Color Logic |
|---|---|---|---|
| 1 | Total Rides | R1 | Neutral (always) |
| 2 | Completion Rate | R7 | Green >= 85%, yellow 70-84%, red < 70% |
| 3 | No-Show Rate | R8 | Green <= 5%, yellow 6-15%, red > 15% |
| 4 | Active Riders | RI1 | Neutral |
| 5 | Driver Punctuality | D5 (overall) | Green >= 90%, yellow 80-89%, red < 80% |
| 6 | Fleet Available | F2 of F1 | Green = all available, yellow >= 75%, red < 75% |

### 6.2 Dashboard Sub-Tab Widgets

Arranged in a responsive 2-column grid (`analytics-card-grid`):

| Row | Col 1 | Col 2 |
|---|---|---|
| 1 | **KPI Bar** (full width, 6 cards) | -- |
| 2 | **Daily Volume** (line chart, from ride-volume) | **Ride Outcomes** (donut chart, from ride-outcomes) |
| 3 | **Peak Hours Heatmap** (full width, from peak-hours) | -- |
| 4 | **Rides by Day of Week** (column chart, existing) | **Rides by Hour** (column chart, existing) |
| 5 | **Top Routes** (horizontal bar, from routes, top 10) | **Driver Performance** (table, from driver-performance) |
| 6 | **Shift Coverage Trend** (full width, line chart: scheduled vs actual hours) | -- |

### 6.3 New Sub-Tabs (Optional Enhancement)

If the dashboard becomes too dense, these can be broken into additional sub-tabs:

- **Drivers** sub-tab: driver-performance table, driver-utilization chart, punctuality breakdown
- **Riders** sub-tab: rider-cohorts summary, rider-no-shows table, strike distribution histogram

For initial implementation, I recommend keeping these in the Dashboard sub-tab and only splitting when the page becomes sluggish (unlikely given the data volumes).

### 6.4 Reports Sub-Tab Enhancement

Add an "Export Report" button to the Reports sub-tab:

```
[Download Excel Report] button -> calls GET /api/analytics/export-report?from=&to=
```

This replaces the existing CSV-only export with a comprehensive multi-sheet workbook. The existing CSV export functions (`exportTableCSV`, `exportSemesterCSV`) remain available for individual table exports.

---

## 7. Date Range Architecture

### 7.1 Default Range

- On first load: **last 7 days** (today minus 6 days through today).
- The existing `analytics-from` and `analytics-to` date inputs are already in place.

### 7.2 Quick-Select Buttons

Add a row of quick-select buttons between the date inputs and the refresh button:

| Button Label | Range Logic |
|---|---|
| Today | from = today, to = today |
| This Week | from = Monday of current week, to = today |
| Last 7 Days | from = today - 6, to = today |
| Last 30 Days | from = today - 29, to = today |
| This Month | from = 1st of current month, to = today |
| This Semester | Auto-detected (see below) |

### 7.3 Semester Detection

Same logic as existing `semester-report` endpoint:

```
Month 0-4 (Jan-May): Spring → Jan 10 to May 15
Month 5-6 (Jun-Jul): Summer → May 16 to Aug 14
Month 7-11 (Aug-Dec): Fall → Aug 15 to Dec 15
```

### 7.4 Implementation

```javascript
function setQuickRange(preset) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  let from, to = todayStr;

  switch (preset) {
    case 'today':
      from = todayStr;
      break;
    case 'this-week': {
      const d = new Date(today);
      const day = d.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday
      d.setDate(d.getDate() - diff);
      from = d.toISOString().slice(0, 10);
      break;
    }
    case '7d':
      from = new Date(today - 6 * 86400000).toISOString().slice(0, 10);
      break;
    case '30d':
      from = new Date(today - 29 * 86400000).toISOString().slice(0, 10);
      break;
    case 'this-month':
      from = todayStr.slice(0, 8) + '01';
      break;
    case 'semester': {
      const month = today.getMonth();
      const year = today.getFullYear();
      if (month <= 4) { from = `${year}-01-10`; to = `${year}-05-15`; }
      else if (month <= 6) { from = `${year}-05-16`; to = `${year}-08-14`; }
      else { from = `${year}-08-15`; to = `${year}-12-15`; }
      break;
    }
  }

  document.getElementById('analytics-from').value = from;
  document.getElementById('analytics-to').value = to;
  loadAllAnalytics();
}
```

---

## 8. Implementation Notes

### 8.1 Dependency: ExcelJS

For the `/api/analytics/export-report` endpoint, add `exceljs` as a runtime dependency:

```bash
npm install exceljs
```

**Package:** `exceljs` (MIT license, actively maintained, 12k+ GitHub stars)
**Purpose:** Server-side Excel workbook generation with formatting, conditional formatting, and multiple sheets.
**Version:** Latest stable (currently ^4.4.0)
**Alternative considered:** `xlsx` (SheetJS) -- larger bundle, community edition lacks styling. ExcelJS is the better choice for formatted reports.

This is a server-side dependency (not a CDN dependency), so it is appropriate to npm install per the project's convention of only avoiding npm for client-side CDN libraries.

### 8.2 Date Filter Standardization

All new endpoints use the same `buildDateFilter` pattern already in `server.js`. For endpoints that query `clock_events.event_date` (a DATE column) instead of `rides.requested_time` (a TIMESTAMPTZ column), the filter binds as `$1::date` instead of raw timestamp.

**Recommendation:** Extract a reusable helper:

```javascript
function buildDateFilter(qp, column = 'requested_time', startParam = 1) {
  let clause = '';
  const params = [];
  if (qp.from) {
    params.push(qp.from);
    clause += ` AND ${column} >= $${startParam + params.length - 1}`;
  }
  if (qp.to) {
    params.push(qp.to + 'T23:59:59.999Z');
    clause += ` AND ${column} <= $${startParam + params.length - 1}`;
  }
  return { clause, params };
}
```

For DATE columns, append `::date` cast:

```javascript
function buildDateFilterDate(qp, column = 'event_date', startParam = 1) {
  let clause = '';
  const params = [];
  if (qp.from) {
    params.push(qp.from);
    clause += ` AND ${column} >= $${startParam + params.length - 1}::date`;
  }
  if (qp.to) {
    params.push(qp.to);
    clause += ` AND ${column} <= $${startParam + params.length - 1}::date`;
  }
  return { clause, params };
}
```

### 8.3 Performance Considerations

All queries use existing indexed columns:

| Table | Index | Used By |
|---|---|---|
| `rides` | PK on `id` | All ride queries |
| `rides` | `requested_time` (needs index) | All date-filtered ride analytics |
| `clock_events` | `idx_clock_events_employee` | Per-driver queries |
| `clock_events` | `idx_clock_events_date` | Date-filtered clock queries |
| `ride_events` | FK index on `ride_id` | Driver utilization |
| `notifications` | `idx_notifications_user_read` | Not used by analytics |

**Recommended new indexes** (add via migration):

```sql
-- Dramatically speeds up all ride analytics date queries
CREATE INDEX IF NOT EXISTS idx_rides_requested_time ON rides(requested_time);

-- Speeds up route and hotspot queries
CREATE INDEX IF NOT EXISTS idx_rides_pickup_dropoff ON rides(pickup_location, dropoff_location);

-- Speeds up per-driver ride queries
CREATE INDEX IF NOT EXISTS idx_rides_assigned_driver ON rides(assigned_driver_id)
  WHERE assigned_driver_id IS NOT NULL;

-- Speeds up per-vehicle queries
CREATE INDEX IF NOT EXISTS idx_rides_vehicle ON rides(vehicle_id)
  WHERE vehicle_id IS NOT NULL;

-- Speeds up rider cohort queries
CREATE INDEX IF NOT EXISTS idx_rides_rider_email ON rides(rider_email);

-- Speeds up ride_events type lookups for utilization
CREATE INDEX IF NOT EXISTS idx_ride_events_type ON ride_events(type, ride_id);
```

**Query complexity:** Most queries are single-table aggregations with GROUP BY. The most complex is `shift-coverage` which uses a CTE with `generate_series`. For the expected data volume (650+ demo rides, ~5000 real rides per semester), all queries should execute in < 100ms even without the new indexes.

### 8.4 Error Handling Pattern

All endpoints follow the existing pattern in `server.js`:

```javascript
app.get('/api/analytics/ride-volume', requireOffice, async (req, res) => {
  try {
    // ... query logic ...
    res.json(result);
  } catch (err) {
    console.error('analytics ride-volume error:', err);
    res.status(500).json({ error: 'Failed to fetch ride volume analytics' });
  }
});
```

### 8.5 Frontend Integration

New endpoints are consumed by new fetch functions in `public/app.js`, following the existing pattern:

```javascript
async function loadRideVolume() {
  try {
    const res = await fetch('/api/analytics/ride-volume' + getAnalyticsDateParams());
    if (!res.ok) return;
    const data = await res.json();
    renderRideVolumeChart(data);
  } catch (e) { console.error('Ride volume error:', e); }
}
```

These are called from `loadAllAnalytics()` in parallel with existing loaders:

```javascript
async function loadAllAnalytics() {
  await Promise.all([
    loadAnalyticsSummary(),
    loadAnalyticsFrequency(),
    loadAnalyticsHotspots(),
    loadAnalyticsMilestones(),
    loadSemesterReport(),
    loadTardinessAnalytics(),
    // New
    loadRideVolume(),
    loadRideOutcomes(),
    loadPeakHours(),
    loadRoutes(),
    loadDriverPerformance(),
    loadShiftCoverage()
  ]);
}
```

**Note:** `loadRiderCohorts()`, `loadRiderNoShows()`, `loadDriverUtilization()`, `loadFleetUtilization()`, and `loadVehicleDemand()` are loaded on-demand when their respective UI section is visible, to avoid unnecessary API calls.

### 8.6 Excel Export Flow

```
User clicks "Download Report"
  -> Frontend: window.location.href = '/api/analytics/export-report?from=X&to=Y'
  -> Server: runs all analytics queries in parallel
  -> Server: builds ExcelJS Workbook with 8 sheets
  -> Server: streams workbook to response as .xlsx
  -> Browser: downloads file
```

Server-side pseudocode:

```javascript
const ExcelJS = require('exceljs');

app.get('/api/analytics/export-report', requireOffice, async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateParams = { from, to };

    // Run all queries in parallel
    const [summary, volume, routes, driverPerf, riders, fleet, coverage, peakHours] = await Promise.all([
      getAnalyticsSummary(dateParams),
      getRideVolume(dateParams),
      getRoutes(dateParams),
      getDriverPerformance(dateParams),
      getRiderAnalysis(dateParams),
      getFleetUtilization(dateParams),
      getShiftCoverage(dateParams),
      getPeakHours(dateParams)
    ]);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'RideOps';
    workbook.created = new Date();

    // Build each sheet (see Section 5 for schemas)
    buildSummarySheet(workbook, summary, from, to);
    buildDailyVolumeSheet(workbook, volume);
    buildRoutesSheet(workbook, routes);
    buildDriverSheet(workbook, driverPerf);
    buildRiderSheet(workbook, riders);
    buildFleetSheet(workbook, fleet);
    buildCoverageSheet(workbook, coverage);
    buildPeakHoursSheet(workbook, peakHours);

    // Set response headers
    const filename = `rideops-report-${from || 'all'}-to-${to || 'now'}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream workbook
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('Export report error:', err);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});
```

### 8.7 File Organization for New Code

All new endpoint handlers go in `server.js` after the existing analytics endpoints (after line ~2787) and before the notification preferences section. Group them together with a section comment:

```javascript
// ----- Advanced Analytics Endpoints -----
// (ride-volume, ride-outcomes, peak-hours, routes, driver-performance,
//  driver-utilization, rider-cohorts, rider-no-shows, fleet-utilization,
//  vehicle-demand, shift-coverage, export-report)
```

The ExcelJS report builder helper functions can be extracted to a separate file if they exceed ~200 lines:

```
server.js                  -- endpoint handlers (route definitions)
analytics-export.js        -- ExcelJS workbook builder functions (optional extraction)
```

### 8.8 Route Registration Order

All new `/api/analytics/*` routes use distinct path segments (no parameterized segments like `/:id`), so route ordering is not a concern. They can be added in any order after the existing analytics routes.

### 8.9 Caching Consideration

Analytics queries are read-only and executed on-demand (not polled). Given the expected data volumes (< 10,000 rides per semester), no server-side caching layer is needed. If performance becomes an issue at scale:

1. Add `Cache-Control: private, max-age=60` headers to allow browser-level caching for 60 seconds.
2. Optionally implement a simple in-memory LRU cache keyed on `(endpoint, from, to)` with 60-second TTL.

This is not needed for initial implementation.
