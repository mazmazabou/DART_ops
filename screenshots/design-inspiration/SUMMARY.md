# RideOps Design Inspiration — Screenshot Library

**Total images:** 69 screenshots across 6 categories
**Purpose:** UI/UX reference for redesigning the RideOps campus transportation platform (Office Manager desktop view, Driver mobile view, Rider mobile view)
**Collected:** February 2026

---

## How to use this library

Each section maps to a specific part of the RideOps interface. The "RideOps relevance" column explains what design element to borrow. Screenshots are organized from most directly applicable to more loosely inspirational.

---

## 1. `shifts/` — Scheduling & Shift Management (11 images)

These inform the **Office Manager's shift scheduling panel** — the weekly grid where office staff manage driver schedules.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `wheniwork-weekly-schedule.webp` | When I Work | Weekly driver schedule grid | Color-coded shift blocks by employee; drag-to-resize time ranges |
| `wheniwork-scheduling-hero.png` | When I Work | Full scheduler overview | Compact row-per-employee layout with day columns; works well at 5 drivers |
| `wheniwork-auto-scheduling.png` | When I Work | Auto-fill open shifts | "Auto-schedule" button concept — could map to "fill from recurring rides" |
| `homebase-weekly-schedule-grid.webp` | Homebase | Weekly grid layout | Strong visual contrast between shifts and empty slots; publish workflow |
| `homebase-publish-schedule-modal.webp` | Homebase | Publish/confirm schedule | Modal confirmation before publishing shifts — reduces accidental changes |
| `homebase-scheduling-mobile.png` | Homebase | Mobile shift view for drivers | Driver-side view of their own schedule — relevant for driver.html |
| `deputy-scheduling-grid.png` | Deputy | Scheduling grid with avatars | Profile photos on shift rows help dispatchers recognize drivers quickly |
| `deputy-micro-scheduling.png` | Deputy | Fine-grained time control | 15-minute increment blocks; good for service hour precision (8am–7pm) |
| `deputy-open-shift-approval.png` | Deputy | Open shift requests | Approval workflow for unassigned shifts — maps to unassigned ride handling |
| `deputy-shift-swapping.png` | Deputy | Shift swap requests | Driver-initiated swap UI — could inspire ride reassignment requests |
| `deputy-analytics.png` | Deputy | Hours/coverage analytics | Shift coverage summary — could become a driver availability dashboard |

**Design patterns to borrow:**
- Row-per-driver, column-per-day grid with drag-to-add (already implemented — use these for visual refinement)
- Color-coded shift blocks matching driver avatar colors
- "Publish" confirmation modal to avoid accidental schedule changes

---

## 2. `dispatch/` — Dispatch Board & Real-Time Monitoring (13 images)

These inform the **Office Manager's Dispatch & Monitoring tab** — the live board showing driver locations, ride statuses, and assignment flow.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `servicetitan-weekly-dispatch-board.png` | ServiceTitan | Master dispatch board layout | Color-coded job cards per technician row; status columns; very scannable |
| `servicetitan-daily-dispatch-board.png` | ServiceTitan | Daily view with time slots | Hour-by-hour breakdown per driver — good for busy dispatch days |
| `servicetitan-daily-dispatch-enhanced.png` | ServiceTitan | Enhanced daily view | Ride cards with customer name + location visible at a glance |
| `servicetitan-dispatch-jobs-grid.png` | ServiceTitan | Job list panel | Table-style fallback for dispatch when grid gets crowded |
| `servicetitan-dispatch-configure.png` | ServiceTitan | Configure board columns | Column/filter customization panel — advanced feature for later |
| `servicetitan-dispatch-weekly-2.png` | ServiceTitan | Weekly board alternate | Second variation showing resource utilization per driver column |
| `onfleet-dispatch-board.png` | Onfleet | Live task board | Map-centric dispatch with driver markers; task list on left sidebar |
| `onfleet-route-optimization.png` | Onfleet | Route optimization view | Multi-stop route visualization — useful if DART expands to route planning |
| `onfleet-real-time-tracking.png` | Onfleet | Real-time driver tracking | Live GPS dot per driver on map; ETA countdown — core DART dispatch feature |
| `samsara-fleet-dashboard-hero.png` | Samsara | Fleet overview | Vehicle status cards (active/idle/stopped) with live location |
| `samsara-dashboard-menus.png` | Samsara | Navigation & menus | Sidebar menu structure for fleet management apps |
| `samsara-dispatch-vehicle.png` | Samsara | Dispatch specific vehicle | "Assign task to vehicle" modal with map preview |
| `samsara-dispatch-better-way.png` | Samsara | Dispatch workflow | Before/after showing simplified dispatch — reduce steps to assign a ride |

**Design patterns to borrow:**
- Driver rows with color-coded ride status cards (pending → assigned → in-progress → complete)
- Map panel + list panel split layout for dispatch view
- Live status indicators with countdown timers (critical for grace period display)
- Compact ride cards showing: rider name, pickup → dropoff, time, status badge

---

## 3. `driver/` — Driver Mobile App (15 images)

These inform **driver.html** — the mobile-first view drivers use to claim rides, navigate, and update ride status.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `uber-driver-all-offers.gif` | Uber Driver | Ride request notification | The "accept/decline" incoming ride card with timer — key interaction model |
| `uber-driver-app-features.webp` | Uber Driver | Feature overview | Core driver app screens: home map, earnings, trip history |
| `uber-driver-comfort-electric.webp` | Uber Driver | Ride type badges | Visual differentiation of ride types — could map to DART's standard vs. accessible |
| `lyft-driver-homescreen-options.png` | Lyft Driver | Driver home screen | Toggle for going online/offline + map; clean single-action layout |
| `lyft-driver-location-filters.jpg` | Lyft Driver | Location preference filters | Driver can set preferred zones — could map to "claim rides near me" |
| `lyft-driver-settings-screen.png` | Lyft Driver | Driver settings/profile | Account settings layout for driver profile page |
| `lyft-winter-release-ui.png` | Lyft Driver | Modern driver UI (2024) | Refreshed dark map UI with bottom sheet for ride info |
| `lyft-early-2024-blog.png` | Lyft Driver | Earnings & bonuses screen | Earnings summary card — useful for driver shift summary view |
| `onfleet-driver-app-hero.png` | Onfleet Driver | Driver task list view | Clean list of assigned deliveries/rides with status indicators |
| `onfleet-driver-app-timeline.png` | Onfleet Driver | Timeline/sequence view | Order of stops with ETA per stop — good for multi-ride shifts |
| `onfleet-driver-app-gps.png` | Onfleet Driver | Turn-by-turn navigation | In-app map with next turn highlighted; pickup pin prominent |
| `doordash-dasher-header.jpg` | DoorDash Dasher | App branding & header | "Dash Now" button — single primary CTA; driver online toggle |
| `doordash-dasher-experience.webp` | DoorDash Dasher | Driver experience overview | Multi-screen layout showing the full dasher journey |
| `doordash-dasher-reddit-orders.png` | DoorDash Dasher | Order cards (real UI) | Real user screenshot of order queue — raw look at actual card density |
| `doordash-dasher-youtube-tutorial.jpg` | DoorDash Dasher | Tutorial frame | Step-by-step claim flow; how drivers are taught to use the app |

**Design patterns to borrow:**
- Large "Go Online / Clock In" toggle as the primary driver home action
- Bottom sheet pattern: map fills the screen, ride info slides up from bottom
- Incoming ride card with countdown timer (15 seconds to accept)
- Status progression buttons: large, full-width, single CTA per step (Claim → On My Way → I'm Here → Done)
- Grace timer displayed prominently with circular countdown

---

## 4. `rider/` — Rider Booking App (9 images)

These inform **rider.html** — the mobile-first view where riders request rides, track status, and manage bookings.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `uber-ride-screenshot-1.png` | Uber Rider | Booking screen | Pickup/dropoff input with autocomplete; clean map background |
| `uber-ride-screenshot-2.png` | Uber Rider | Ride type selection | Card carousel for selecting ride options before confirming |
| `uber-ride-screenshot-3.png` | Uber Rider | Driver en route / ETA | ETA display with driver info card; "Cancel" accessibility |
| `lyft-rider-request-ride-uxmag.png` | Lyft Rider | Full booking flow (UX Mag) | Side-by-side screen flow showing all steps from request to pickup |
| `lyft-rider-engineering-flow.png` | Lyft Rider | Engineering-published flow | Official Lyft Engineering Medium article; complete rider journey screens |
| `lyft-rider-redesign-flow.png` | Lyft Rider | Redesign study (3170px) | High-fidelity redesign mockup — best source for modern interaction patterns |
| `lyft-rider-cancel-ride.jpg` | Lyft Rider | Cancel ride confirmation | Cancel button placement and confirmation dialog — DART has this too |
| `lyft-rider-booking-tracking.webp` | Lyft Rider | Booking & tracking combo | Side-by-side booking vs. live tracking state comparison |
| `via-scheduling-engine.png` | Via (transit) | Scheduled ride booking | Calendar + time picker for pre-scheduled rides — maps to DART's `requested_time` |

**Design patterns to borrow:**
- Large input fields for pickup/dropoff with building name autocomplete (prominent)
- Request confirmation screen with: pickup, dropoff, time, notes summary before submit
- Ride status card that updates live: Pending → Approved → Driver on the way → Driver here
- Driver arrived state: show grace countdown ("Driver is waiting — 4:30 remaining")
- Simple ride history list with status badges and tap-to-expand details

---

## 5. `layout/` — Dashboard Layout & Navigation Patterns (13 images)

These inform the **overall UI architecture** of all three RideOps views — sidebar navigation, content area layout, card grids, and data density.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `linear-main-dashboard.webp` | Linear | Office console layout | Left sidebar + main content area; dense but readable; good type hierarchy |
| `linear-sidebar-content.webp` | Linear | Sidebar navigation | Collapsible sidebar with icon + label; section grouping (Staff, Rides, Dispatch) |
| `linear-dashboard-3.png` | Linear | Issue/task board | Kanban-style cards by status — maps to ride status columns view |
| `linear-homepage-og.jpg` | Linear | OG/hero layout | Clean dark UI with strong typography; minimal chrome |
| `notion-sidebar-navigation.png` | Notion | Sidebar + content area | 3840px wide; hierarchical sidebar with page tree; collapsible sections |
| `notion-database-list-view.png` | Notion | Table/list data view | Alternating row colors; sortable columns; inline status badges |
| `notion-personal-dashboard.png` | Notion | Personal dashboard layout | Widget grid: summary cards + detail panels; good for office console home |
| `notion-meta.png` | Notion | Brand/meta layout | Notion's identity in UI form; clean, neutral design language |
| `stripe-payments-dashboard.png` | Stripe | Payments overview | Chart + metric cards above a transaction table — office ride summary view |
| `stripe-dashboard-home-charts.png` | Stripe | Home dashboard charts | Revenue chart with period selector — could inspire "rides today vs. target" |
| `stripe-dashboard-dribbble.gif` | Stripe (Dribbble) | Animated dashboard | Demonstrates smooth transitions between dashboard states |
| `stripe-login-bg.jpg` | Stripe | Auth page background | Minimal auth page with centered card — good for login.html refinement |
| `vercel-twitter-card.png` | Vercel | Deployment dashboard | Project grid cards with status indicators — compact info cards |

**Design patterns to borrow:**
- Fixed left sidebar (64px icons or 200px expanded) with main content scrolling independently
- Top nav with: page title, breadcrumb, and action button (e.g., "New Ride", "Add Driver")
- Metric summary row at top of each section: total rides, active drivers, pending approvals
- Status badges as colored pills (pending=gray, approved=blue, in-progress=orange, done=green)
- Card-based layout for mobile views; table layout for desktop office view

---

## 6. `analytics/` — Analytics & Reporting Views (7 images)

These inform any future **reporting/analytics panel** in the Office console — ride volume, driver performance, no-show tracking.

| Filename | Source App | RideOps Relevance | Key Design Takeaway |
|----------|-----------|-------------------|---------------------|
| `posthog-product-analytics-main.png` | PostHog | Analytics dashboard (2720px) | Trend chart + breakdown table; time range selector; segment filters |
| `posthog-product-analytics-og.jpg` | PostHog | Product analytics OG | Summary KPI cards + trend lines; clean two-column layout |
| `posthog-dashboard-dark.png` | PostHog | Dark mode dashboard | Dark theme analytics — could be a driver-view option |
| `posthog-g2-dashboard.png` | PostHog | G2 review screenshot | Real user dashboard showing event tracking by category |
| `posthog-user-paths.png` | PostHog | User path/funnel view | Sankey diagram of user flows — maps to ride status funnel analysis |
| `plausible-analytics-dashboard.jpg` | Plausible Analytics | Minimalist web analytics | Very clean single-page dashboard; only essential metrics shown |
| `plausible-promo.jpg` | Plausible Analytics | Promo/overview layout | Side-by-side metric cards; no clutter; good for executive summary |

**Design patterns to borrow:**
- KPI cards at top: "Rides today", "Completion rate", "No-shows this week", "Active drivers"
- Simple line/bar chart for ride volume over time (weekly view by default)
- Filterable table below the chart for drilling into specific rides or drivers
- Exportable data view — office staff need to report to transportation office

---

## Cross-Cutting Design Recommendations

Based on reviewing all 69 screenshots, here are the highest-priority design changes for RideOps:

### For the Office Console (index.html + app.js)
1. **Dispatch board as primary view** — Make the live dispatch board the default tab, not rides list. Follow ServiceTitan's pattern: driver columns with ride cards flowing through them.
2. **Status badge system** — Consistent colored pill badges throughout: use the same 6 colors for all 6 ride statuses across every view.
3. **Metric summary bar** — Add a sticky top bar showing: Active Drivers / Pending Rides / In Progress / Completed Today.

### For the Driver App (driver.html)
1. **Map-first layout** — Full-screen map with a slide-up bottom sheet for ride details. Current layout is list-based; switch to map-primary.
2. **Single CTA principle** — Only show one action button at a time. The current UI shows multiple buttons; follow Uber/Lyft's pattern of one large button per ride state.
3. **Grace timer prominence** — The 5-minute grace countdown is the most time-sensitive element. Make it the full-width hero element when active (large circular countdown like DoorDash).

### For the Rider App (rider.html)
1. **Progressive disclosure** — Don't show the full form at once. Step 1: Where to? Step 2: When? Step 3: Notes → Confirm. Follow Lyft's multi-step booking pattern.
2. **Live status card** — After booking, replace the form with a single status card that updates in real time. Show driver name, ETA, and grace countdown when applicable.
3. **Clear cancellation path** — Prominent "Cancel Ride" button with confirmation dialog (Lyft pattern) — don't hide it in a menu.

---

*Generated for the DART/RideOps UI redesign project — USC Transportation*
