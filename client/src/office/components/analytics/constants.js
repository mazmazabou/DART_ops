// Widget Registry — defines all available analytics widgets (ported from widget-registry.js)

export const WIDGET_LAYOUT_VERSION = 3;

export const WIDGET_CATEGORIES = {
  overview: 'Overview',
  rides: 'Rides',
  drivers: 'Drivers',
  riders: 'Riders',
  fleet: 'Fleet',
  locations: 'Locations',
  attendance: 'Attendance',
  achievements: 'Achievements',
};

export const WIDGET_REGISTRY = {
  'kpi-grid': {
    title: 'Key Metrics',
    icon: 'ti-dashboard',
    category: 'overview',
    skeletonType: 'kpi',
    minW: 12, maxW: 12, minH: 2, maxH: 3, noResize: true,
  },
  'ride-volume': {
    title: 'Ride Volume',
    icon: 'ti-chart-area-line',
    category: 'rides',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'ride-outcomes': {
    title: 'Ride Outcomes',
    icon: 'ti-chart-donut-3',
    category: 'rides',
    skeletonType: 'donut',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'peak-hours': {
    title: 'Peak Hours',
    icon: 'ti-flame',
    category: 'rides',
    skeletonType: 'heatmap',
    minW: 6, maxW: 12, minH: 4, maxH: 7,
  },
  'rides-by-dow': {
    title: 'Rides by Day of Week',
    icon: 'ti-calendar-stats',
    category: 'rides',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'rides-by-hour': {
    title: 'Rides by Hour',
    icon: 'ti-clock-hour-4',
    category: 'rides',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'top-routes': {
    title: 'Top Routes',
    icon: 'ti-route',
    category: 'rides',
    skeletonType: 'table',
    minW: 6, maxW: 12, minH: 3, maxH: 7,
  },
  'driver-leaderboard': {
    title: 'Driver Leaderboard',
    icon: 'ti-steering-wheel',
    category: 'drivers',
    skeletonType: 'table',
    minW: 6, maxW: 12, minH: 3, maxH: 7,
  },
  'shift-coverage': {
    title: 'Shift Coverage',
    icon: 'ti-calendar-stats',
    category: 'drivers',
    skeletonType: 'table',
    minW: 6, maxW: 12, minH: 4, maxH: 8,
  },
  'fleet-utilization': {
    title: 'Fleet Utilization',
    icon: 'ti-bus',
    category: 'fleet',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'rider-cohorts': {
    title: 'Rider Cohorts',
    icon: 'ti-users-group',
    category: 'riders',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 5,
  },
  'hotspot-pickups': {
    title: 'Top Pickup Locations',
    icon: 'ti-map-pin',
    category: 'locations',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'hotspot-dropoffs': {
    title: 'Top Dropoff Locations',
    icon: 'ti-map-pin-filled',
    category: 'locations',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 6,
  },
  'route-demand-matrix': {
    title: 'Route Demand Matrix',
    icon: 'ti-grid-dots',
    category: 'locations',
    skeletonType: 'heatmap',
    minW: 6, maxW: 12, minH: 4, maxH: 7,
  },
  'hotspot-top-routes': {
    title: 'Top Routes (Hotspots)',
    icon: 'ti-route',
    category: 'locations',
    skeletonType: 'table',
    minW: 6, maxW: 12, minH: 3, maxH: 6,
  },
  'driver-milestones': {
    title: 'Driver Milestones',
    icon: 'ti-trophy',
    category: 'achievements',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 8,
  },
  'rider-milestones': {
    title: 'Rider Milestones',
    icon: 'ti-award',
    category: 'achievements',
    skeletonType: 'chart',
    minW: 3, maxW: 12, minH: 3, maxH: 8,
  },
  'attendance-kpis': {
    title: 'Attendance KPIs',
    icon: 'ti-chart-bar',
    category: 'attendance',
    skeletonType: 'kpi',
    minW: 12, maxW: 12, minH: 2, maxH: 3, noResize: true,
  },
  'attendance-donut': {
    title: 'Attendance Distribution',
    icon: 'ti-chart-donut-3',
    category: 'attendance',
    skeletonType: 'donut',
    minW: 3, maxW: 9, minH: 3, maxH: 5,
  },
  'tardiness-by-dow': {
    title: 'Tardiness by Day',
    icon: 'ti-calendar-stats',
    category: 'attendance',
    skeletonType: 'chart',
    minW: 3, maxW: 9, minH: 3, maxH: 5,
  },
  'tardiness-trend': {
    title: 'Tardiness Trend',
    icon: 'ti-trending-up',
    category: 'attendance',
    skeletonType: 'chart',
    minW: 6, maxW: 12, minH: 3, maxH: 6,
  },
  'punctuality-table': {
    title: 'Punctuality by Driver',
    icon: 'ti-table',
    category: 'attendance',
    skeletonType: 'table',
    minW: 6, maxW: 12, minH: 4, maxH: 8,
  },
};

export const DEFAULT_WIDGET_LAYOUT = [
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
  { id: 'rider-cohorts',       x: 6,  y: 24, w: 6,  h: 4 },
];

export const DEFAULT_HOTSPOTS_LAYOUT = [
  { id: 'hotspot-pickups',      x: 0,  y: 0,  w: 6,  h: 4 },
  { id: 'hotspot-dropoffs',     x: 6,  y: 0,  w: 6,  h: 4 },
  { id: 'hotspot-top-routes',   x: 0,  y: 4,  w: 9,  h: 4 },
  { id: 'route-demand-matrix',  x: 0,  y: 8,  w: 12, h: 5 },
];

export const DEFAULT_MILESTONES_LAYOUT = [
  { id: 'driver-milestones',  x: 0,  y: 0,  w: 6,  h: 4 },
  { id: 'rider-milestones',   x: 6,  y: 0,  w: 6,  h: 4 },
];

export const DEFAULT_ATTENDANCE_LAYOUT = [
  { id: 'attendance-kpis',    x: 0,  y: 0,  w: 12, h: 2 },
  { id: 'attendance-donut',   x: 0,  y: 2,  w: 6,  h: 4 },
  { id: 'tardiness-by-dow',   x: 6,  y: 2,  w: 6,  h: 4 },
  { id: 'tardiness-trend',    x: 0,  y: 6,  w: 6,  h: 4 },
  { id: 'punctuality-table',  x: 0,  y: 10, w: 12, h: 5 },
];

// Tab configs used by WidgetGrid
export const TAB_CONFIGS = {
  dashboard: {
    storagePrefix: 'dashboard',
    defaultLayout: DEFAULT_WIDGET_LAYOUT,
    allowedWidgets: null, // all widgets allowed
  },
  hotspots: {
    storagePrefix: 'hotspots',
    defaultLayout: DEFAULT_HOTSPOTS_LAYOUT,
    allowedWidgets: ['hotspot-pickups', 'hotspot-dropoffs', 'hotspot-top-routes', 'route-demand-matrix'],
  },
  milestones: {
    storagePrefix: 'milestones',
    defaultLayout: DEFAULT_MILESTONES_LAYOUT,
    allowedWidgets: ['driver-milestones', 'rider-milestones'],
  },
  attendance: {
    storagePrefix: 'attendance',
    defaultLayout: DEFAULT_ATTENDANCE_LAYOUT,
    allowedWidgets: ['attendance-kpis', 'attendance-donut', 'tardiness-by-dow', 'tardiness-trend', 'punctuality-table'],
  },
};

// Report sheet definitions for Excel export
export const REPORT_SHEETS = {
  full: {
    label: 'Full Report (All Sheets)',
    desc: 'Comprehensive export with all available data sheets.',
    sheets: [
      { name: 'Summary', icon: 'ti-list-details', desc: 'Aggregate KPIs and rates' },
      { name: 'Daily Volume', icon: 'ti-chart-bar', desc: 'Rides per day with status breakdown' },
      { name: 'Routes', icon: 'ti-route', desc: 'Top routes by frequency' },
      { name: 'Driver Performance', icon: 'ti-steering-wheel', desc: 'Per-driver rides, punctuality, hours' },
      { name: 'Rider Analysis', icon: 'ti-users', desc: 'Active, new, returning, and at-risk riders' },
      { name: 'Fleet', icon: 'ti-car', desc: 'Vehicle usage and maintenance' },
      { name: 'Shift Coverage', icon: 'ti-clock', desc: 'Scheduled vs actual driver-hours' },
      { name: 'Peak Hours', icon: 'ti-flame', desc: 'Day-of-week by hour heatmap' },
    ],
  },
  rides: {
    label: 'Rides Only',
    desc: 'Ride volume, daily trends, and popular routes.',
    sheets: [
      { name: 'Summary', icon: 'ti-list-details', desc: 'Aggregate KPIs and rates' },
      { name: 'Daily Volume', icon: 'ti-chart-bar', desc: 'Rides per day with status breakdown' },
      { name: 'Routes', icon: 'ti-route', desc: 'Top routes by frequency' },
    ],
  },
  drivers: {
    label: 'Driver Performance',
    desc: 'Driver scorecards and shift coverage analysis.',
    sheets: [
      { name: 'Summary', icon: 'ti-list-details', desc: 'Aggregate KPIs and rates' },
      { name: 'Driver Performance', icon: 'ti-steering-wheel', desc: 'Per-driver rides, punctuality, hours' },
      { name: 'Shift Coverage', icon: 'ti-clock', desc: 'Scheduled vs actual driver-hours' },
    ],
  },
  riders: {
    label: 'Rider Analysis',
    desc: 'Rider cohorts, activity, and engagement metrics.',
    sheets: [
      { name: 'Summary', icon: 'ti-list-details', desc: 'Aggregate KPIs and rates' },
      { name: 'Rider Analysis', icon: 'ti-users', desc: 'Active, new, returning, and at-risk riders' },
    ],
  },
  fleet: {
    label: 'Fleet Report',
    desc: 'Vehicle utilization and maintenance history.',
    sheets: [
      { name: 'Summary', icon: 'ti-list-details', desc: 'Aggregate KPIs and rates' },
      { name: 'Fleet', icon: 'ti-car', desc: 'Vehicle usage and maintenance' },
    ],
  },
};

export function getLogicalSize(gridStackW) {
  if (gridStackW <= 3) return 'xs';
  if (gridStackW <= 6) return 'sm';
  if (gridStackW <= 9) return 'md';
  return 'lg';
}

export function resolveColor(cssVar) {
  if (!cssVar || !cssVar.startsWith('var(')) return cssVar;
  const propName = cssVar.replace(/^var\(/, '').replace(/\)$/, '').trim();
  return getComputedStyle(document.documentElement).getPropertyValue(propName).trim() || cssVar;
}
