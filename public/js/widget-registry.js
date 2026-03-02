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
    defaultSize: 'lg',
    allowedSizes: ['lg'],
    containerId: 'analytics-kpi-grid',
    containerClass: 'kpi-bar',
    category: 'overview',
    description: 'KPI cards showing totals, completion rate, and averages.'
  },
  'ride-volume': {
    title: 'Ride Volume',
    icon: 'ti-chart-area-line',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-ride-volume',
    category: 'rides',
    description: 'Daily ride volume over the selected date range.'
  },
  'ride-outcomes': {
    title: 'Ride Outcomes',
    icon: 'ti-chart-donut-3',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-ride-outcomes',
    category: 'rides',
    description: 'Donut chart of ride completion, cancellation, and no-show rates.'
  },
  'peak-hours': {
    title: 'Peak Hours',
    icon: 'ti-flame',
    defaultSize: 'lg',
    allowedSizes: ['md', 'lg'],
    containerId: 'chart-peak-hours',
    category: 'rides',
    description: 'Day-of-week by hour heatmap showing ride demand.'
  },
  'rides-by-dow': {
    title: 'Rides by Day of Week',
    icon: 'ti-calendar-stats',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-dow',
    category: 'rides',
    description: 'Column chart of ride counts per day of week.'
  },
  'rides-by-hour': {
    title: 'Rides by Hour',
    icon: 'ti-clock-hour-4',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-hour',
    category: 'rides',
    description: 'Column chart of ride counts per hour of the day.'
  },
  'top-routes': {
    title: 'Top Routes',
    icon: 'ti-route',
    defaultSize: 'sm',
    allowedSizes: ['sm', 'md', 'lg'],
    containerId: 'chart-top-routes',
    category: 'rides',
    description: 'Ranked table of most popular pickup-to-dropoff routes.'
  },
  'driver-leaderboard': {
    title: 'Driver Leaderboard',
    icon: 'ti-steering-wheel',
    defaultSize: 'sm',
    allowedSizes: ['sm', 'md', 'lg'],
    containerId: 'chart-driver-leaderboard',
    category: 'drivers',
    description: 'Driver scorecard with rides, punctuality, and hours.'
  },
  'shift-coverage': {
    title: 'Shift Coverage',
    icon: 'ti-calendar-stats',
    defaultSize: 'lg',
    allowedSizes: ['md', 'lg'],
    containerId: 'chart-shift-coverage',
    category: 'drivers',
    description: 'Scheduled vs actual driver hours, day-by-day gap analysis.'
  },
  'fleet-utilization': {
    title: 'Fleet Utilization',
    icon: 'ti-bus',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-fleet-util',
    category: 'fleet',
    description: 'Per-vehicle ride counts and maintenance in period.'
  },
  'rider-cohorts': {
    title: 'Rider Cohorts',
    icon: 'ti-users-group',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'chart-rider-cohorts',
    category: 'riders',
    description: 'Active, new, returning, churned, at-risk rider segments.'
  },
  'hotspot-pickups': {
    title: 'Top Pickup Locations',
    icon: 'ti-map-pin',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'w-hotspot-pickups',
    tabContainers: {
      hotspots: 'ht-hotspot-pickups'
    },
    category: 'locations',
    description: 'Ranked bar list of most popular pickup locations.'
  },
  'hotspot-dropoffs': {
    title: 'Top Dropoff Locations',
    icon: 'ti-map-pin-filled',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'w-hotspot-dropoffs',
    tabContainers: {
      hotspots: 'ht-hotspot-dropoffs'
    },
    category: 'locations',
    description: 'Ranked bar list of most popular dropoff locations.'
  },
  'route-demand-matrix': {
    title: 'Route Demand Matrix',
    icon: 'ti-grid-dots',
    defaultSize: 'lg',
    allowedSizes: ['md', 'lg'],
    containerId: 'w-hotspot-matrix',
    tabContainers: {
      hotspots: 'ht-hotspot-matrix'
    },
    category: 'locations',
    description: 'Origin-destination matrix showing route demand.'
  },
  'hotspot-top-routes': {
    title: 'Top Routes (Hotspots)',
    icon: 'ti-route',
    defaultSize: 'md',
    allowedSizes: ['sm', 'md', 'lg'],
    containerId: 'ht-top-routes',
    category: 'locations',
    description: 'Top routes by frequency from hotspot analysis.'
  },
  'driver-milestones': {
    title: 'Driver Milestones',
    icon: 'ti-trophy',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'w-driver-milestones',
    tabContainers: {
      milestones: 'ms-driver-milestones'
    },
    category: 'achievements',
    description: 'Driver achievement badges based on cumulative rides.'
  },
  'rider-milestones': {
    title: 'Rider Milestones',
    icon: 'ti-award',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'w-rider-milestones',
    tabContainers: {
      milestones: 'ms-rider-milestones'
    },
    category: 'achievements',
    description: 'Rider achievement badges based on cumulative rides.'
  },
  // ── Attendance Widgets ──
  'attendance-kpis': {
    title: 'Attendance KPIs',
    icon: 'ti-chart-bar',
    defaultSize: 'lg',
    allowedSizes: ['lg'],
    containerId: 'att-kpis',
    containerClass: 'kpi-bar',
    category: 'attendance',
    description: 'KPI cards: total clock-ins, on-time rate, tardy count, avg tardiness, missed shifts.'
  },
  'attendance-donut': {
    title: 'Attendance Distribution',
    icon: 'ti-chart-donut-3',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md'],
    containerId: 'att-donut',
    category: 'attendance',
    description: 'SVG donut chart of on-time vs late distribution.'
  },
  'tardiness-by-dow': {
    title: 'Tardiness by Day',
    icon: 'ti-calendar-stats',
    defaultSize: 'sm',
    allowedSizes: ['xs', 'sm', 'md'],
    containerId: 'att-dow',
    category: 'attendance',
    description: 'Column chart of tardiness by day of week.'
  },
  'tardiness-trend': {
    title: 'Tardiness Trend',
    icon: 'ti-trending-up',
    defaultSize: 'lg',
    allowedSizes: ['xs', 'sm', 'md', 'lg'],
    containerId: 'att-trend',
    category: 'attendance',
    description: 'Area chart showing daily tardiness trend over the selected period.'
  },
  'punctuality-table': {
    title: 'Punctuality by Driver',
    icon: 'ti-table',
    defaultSize: 'lg',
    allowedSizes: ['md', 'lg'],
    containerId: 'att-punctuality',
    category: 'attendance',
    description: 'Table of driver punctuality: clock-ins, tardy count, on-time %, avg/max late, missed shifts.'
  }
};

// ── Default Layouts Per Tab ──

var DEFAULT_WIDGET_LAYOUT = [
  { id: 'kpi-grid', size: 'lg' },
  { id: 'ride-volume', size: 'sm' },
  { id: 'ride-outcomes', size: 'sm' },
  { id: 'peak-hours', size: 'lg' },
  { id: 'rides-by-dow', size: 'sm' },
  { id: 'rides-by-hour', size: 'sm' },
  { id: 'top-routes', size: 'sm' },
  { id: 'driver-leaderboard', size: 'sm' },
  { id: 'shift-coverage', size: 'lg' },
  { id: 'fleet-utilization', size: 'sm' },
  { id: 'rider-cohorts', size: 'sm' }
];

var DEFAULT_HOTSPOTS_LAYOUT = [
  { id: 'hotspot-pickups', size: 'sm' },
  { id: 'hotspot-dropoffs', size: 'sm' },
  { id: 'hotspot-top-routes', size: 'md' },
  { id: 'route-demand-matrix', size: 'lg' }
];

var DEFAULT_MILESTONES_LAYOUT = [
  { id: 'driver-milestones', size: 'sm' },
  { id: 'rider-milestones', size: 'sm' }
];

var DEFAULT_ATTENDANCE_LAYOUT = [
  { id: 'attendance-kpis', size: 'lg' },
  { id: 'attendance-donut', size: 'sm' },
  { id: 'tardiness-by-dow', size: 'sm' },
  { id: 'tardiness-trend', size: 'lg' },
  { id: 'punctuality-table', size: 'lg' }
];
