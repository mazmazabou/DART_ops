/* Widget Registry — defines all available analytics widgets */
/* global WIDGET_REGISTRY, WIDGET_CATEGORIES, DEFAULT_WIDGET_LAYOUT */
/* global DEFAULT_HOTSPOTS_LAYOUT, DEFAULT_MILESTONES_LAYOUT, DEFAULT_ATTENDANCE_LAYOUT */

var WIDGET_CATEGORIES = {
  overview: 'Overview',
  rides: 'Rides',
  drivers: 'Drivers',
  riders: 'Riders',
  fleet: 'Fleet',
  locations: 'Locations',
  attendance: 'Attendance',
  achievements: 'Achievements'
};

var WIDGET_REGISTRY = {
  'kpi-grid': {
    title: 'Key Metrics',
    icon: 'ti-dashboard',
    containerId: 'analytics-kpi-grid',
    containerClass: 'kpi-bar',
    category: 'overview',
    description: 'KPI cards showing totals, completion rate, and averages.',
    minW: 12, maxW: 12, minH: 2, maxH: 3, noResize: true
  },
  'ride-volume': {
    title: 'Ride Volume',
    icon: 'ti-chart-area-line',
    containerId: 'chart-ride-volume',
    category: 'rides',
    description: 'Daily ride volume over the selected date range.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'ride-outcomes': {
    title: 'Ride Outcomes',
    icon: 'ti-chart-donut-3',
    containerId: 'chart-ride-outcomes',
    category: 'rides',
    description: 'Donut chart of ride completion, cancellation, and no-show rates.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'peak-hours': {
    title: 'Peak Hours',
    icon: 'ti-flame',
    containerId: 'chart-peak-hours',
    category: 'rides',
    description: 'Day-of-week by hour heatmap showing ride demand.',
    minW: 6, maxW: 12, minH: 4, maxH: 7, noResize: false
  },
  'rides-by-dow': {
    title: 'Rides by Day of Week',
    icon: 'ti-calendar-stats',
    containerId: 'chart-dow',
    category: 'rides',
    description: 'Column chart of ride counts per day of week.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'rides-by-hour': {
    title: 'Rides by Hour',
    icon: 'ti-clock-hour-4',
    containerId: 'chart-hour',
    category: 'rides',
    description: 'Column chart of ride counts per hour of the day.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'top-routes': {
    title: 'Top Routes',
    icon: 'ti-route',
    containerId: 'chart-top-routes',
    category: 'rides',
    description: 'Ranked table of most popular pickup-to-dropoff routes.',
    minW: 6, maxW: 12, minH: 3, maxH: 7, noResize: false
  },
  'driver-leaderboard': {
    title: 'Driver Leaderboard',
    icon: 'ti-steering-wheel',
    containerId: 'chart-driver-leaderboard',
    category: 'drivers',
    description: 'Driver scorecard with rides, punctuality, and hours.',
    minW: 6, maxW: 12, minH: 3, maxH: 7, noResize: false
  },
  'shift-coverage': {
    title: 'Shift Coverage',
    icon: 'ti-calendar-stats',
    containerId: 'chart-shift-coverage',
    category: 'drivers',
    description: 'Scheduled vs actual driver hours, day-by-day gap analysis.',
    minW: 6, maxW: 12, minH: 4, maxH: 8, noResize: false
  },
  'fleet-utilization': {
    title: 'Fleet Utilization',
    icon: 'ti-bus',
    containerId: 'chart-fleet-util',
    category: 'fleet',
    description: 'Per-vehicle ride counts and maintenance in period.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'rider-cohorts': {
    title: 'Rider Cohorts',
    icon: 'ti-users-group',
    containerId: 'chart-rider-cohorts',
    category: 'riders',
    description: 'Active, new, returning, churned, at-risk rider segments.',
    minW: 3, maxW: 12, minH: 3, maxH: 5, noResize: false
  },
  'hotspot-pickups': {
    title: 'Top Pickup Locations',
    icon: 'ti-map-pin',
    containerId: 'w-hotspot-pickups',
    tabContainers: {
      hotspots: 'ht-hotspot-pickups'
    },
    category: 'locations',
    description: 'Ranked bar list of most popular pickup locations.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'hotspot-dropoffs': {
    title: 'Top Dropoff Locations',
    icon: 'ti-map-pin-filled',
    containerId: 'w-hotspot-dropoffs',
    tabContainers: {
      hotspots: 'ht-hotspot-dropoffs'
    },
    category: 'locations',
    description: 'Ranked bar list of most popular dropoff locations.',
    minW: 3, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'route-demand-matrix': {
    title: 'Route Demand Matrix',
    icon: 'ti-grid-dots',
    containerId: 'w-hotspot-matrix',
    tabContainers: {
      hotspots: 'ht-hotspot-matrix'
    },
    category: 'locations',
    description: 'Origin-destination matrix showing route demand.',
    minW: 6, maxW: 12, minH: 4, maxH: 7, noResize: false
  },
  'hotspot-top-routes': {
    title: 'Top Routes (Hotspots)',
    icon: 'ti-route',
    containerId: 'ht-top-routes',
    category: 'locations',
    description: 'Top routes by frequency from hotspot analysis.',
    minW: 6, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'driver-milestones': {
    title: 'Driver Milestones',
    icon: 'ti-trophy',
    containerId: 'w-driver-milestones',
    tabContainers: {
      milestones: 'ms-driver-milestones'
    },
    category: 'achievements',
    description: 'Driver achievement badges based on cumulative rides.',
    minW: 3, maxW: 12, minH: 3, maxH: 8, noResize: false
  },
  'rider-milestones': {
    title: 'Rider Milestones',
    icon: 'ti-award',
    containerId: 'w-rider-milestones',
    tabContainers: {
      milestones: 'ms-rider-milestones'
    },
    category: 'achievements',
    description: 'Rider achievement badges based on cumulative rides.',
    minW: 3, maxW: 12, minH: 3, maxH: 8, noResize: false
  },
  // -- Attendance Widgets --
  'attendance-kpis': {
    title: 'Attendance KPIs',
    icon: 'ti-chart-bar',
    containerId: 'att-kpis',
    containerClass: 'kpi-bar',
    category: 'attendance',
    description: 'KPI cards: total clock-ins, on-time rate, tardy count, avg tardiness, missed shifts.',
    minW: 12, maxW: 12, minH: 2, maxH: 3, noResize: true
  },
  'attendance-donut': {
    title: 'Attendance Distribution',
    icon: 'ti-chart-donut-3',
    containerId: 'att-donut',
    category: 'attendance',
    description: 'SVG donut chart of on-time vs late distribution.',
    minW: 3, maxW: 9, minH: 3, maxH: 5, noResize: false
  },
  'tardiness-by-dow': {
    title: 'Tardiness by Day',
    icon: 'ti-calendar-stats',
    containerId: 'att-dow',
    category: 'attendance',
    description: 'Column chart of tardiness by day of week.',
    minW: 3, maxW: 9, minH: 3, maxH: 5, noResize: false
  },
  'tardiness-trend': {
    title: 'Tardiness Trend',
    icon: 'ti-trending-up',
    containerId: 'att-trend',
    category: 'attendance',
    description: 'Area chart showing daily tardiness trend over the selected period.',
    minW: 6, maxW: 12, minH: 3, maxH: 6, noResize: false
  },
  'punctuality-table': {
    title: 'Punctuality by Driver',
    icon: 'ti-table',
    containerId: 'att-punctuality',
    category: 'attendance',
    description: 'Table of driver punctuality: clock-ins, tardy count, on-time %, avg/max late, missed shifts.',
    minW: 6, maxW: 12, minH: 4, maxH: 8, noResize: false
  }
};

// -- Default Layouts Per Tab (GridStack format: {id, x, y, w, h}) --

var DEFAULT_WIDGET_LAYOUT = [
  { id: 'kpi-grid',            x: 0,  y: 0,  w: 12, h: 2 },
  { id: 'ride-volume',         x: 0,  y: 2,  w: 6,  h: 4 },
  { id: 'ride-outcomes',       x: 6,  y: 2,  w: 6,  h: 4 },
  { id: 'peak-hours',          x: 0,  y: 6,  w: 12, h: 5 },
  { id: 'rides-by-dow',        x: 0,  y: 11, w: 6,  h: 4 },
  { id: 'rides-by-hour',       x: 6,  y: 11, w: 6,  h: 4 },
  { id: 'top-routes',          x: 0,  y: 15, w: 6,  h: 4 },
  { id: 'driver-leaderboard',  x: 6,  y: 15, w: 6,  h: 4 },
  { id: 'shift-coverage',      x: 0,  y: 19, w: 12, h: 5 },
  { id: 'fleet-utilization',   x: 0,  y: 24, w: 6,  h: 4 },
  { id: 'rider-cohorts',       x: 6,  y: 24, w: 6,  h: 4 }
];

var DEFAULT_HOTSPOTS_LAYOUT = [
  { id: 'hotspot-pickups',      x: 0,  y: 0,  w: 6,  h: 4 },
  { id: 'hotspot-dropoffs',     x: 6,  y: 0,  w: 6,  h: 4 },
  { id: 'hotspot-top-routes',   x: 0,  y: 4,  w: 9,  h: 4 },
  { id: 'route-demand-matrix',  x: 0,  y: 8,  w: 12, h: 5 }
];

var DEFAULT_MILESTONES_LAYOUT = [
  { id: 'driver-milestones',  x: 0,  y: 0,  w: 6,  h: 4 },
  { id: 'rider-milestones',   x: 6,  y: 0,  w: 6,  h: 4 }
];

var DEFAULT_ATTENDANCE_LAYOUT = [
  { id: 'attendance-kpis',    x: 0,  y: 0,  w: 12, h: 2 },
  { id: 'attendance-donut',   x: 0,  y: 2,  w: 6,  h: 4 },
  { id: 'tardiness-by-dow',   x: 6,  y: 2,  w: 6,  h: 4 },
  { id: 'tardiness-trend',    x: 0,  y: 6,  w: 6,  h: 4 },
  { id: 'punctuality-table',  x: 0,  y: 10, w: 12, h: 5 }
];
