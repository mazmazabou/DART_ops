import { useState, useEffect, useCallback } from 'react';
import { fetchAllAnalytics } from '../hooks/useAnalyticsFetch';
import { fetchOpsConfig } from '../../../../api';
import { getCampusPalette } from '../../../../utils/campus';
import WidgetGrid from '../WidgetGrid';
import WidgetToolbar from '../WidgetToolbar';
import WidgetLibraryDrawer from '../WidgetLibraryDrawer';
import { useWidgetLayout } from '../hooks/useWidgetLayout';
import { TAB_CONFIGS, WIDGET_REGISTRY } from '../constants';
import SkeletonLoader from '../shared/SkeletonLoader';

import KPIGridWidget from '../widgets/KPIGridWidget';
import RideVolumeWidget from '../widgets/RideVolumeWidget';
import RideOutcomesWidget from '../widgets/RideOutcomesWidget';
import PeakHoursWidget from '../widgets/PeakHoursWidget';
import RidesByDOWWidget from '../widgets/RidesByDOWWidget';
import RidesByHourWidget from '../widgets/RidesByHourWidget';
import TopRoutesWidget from '../widgets/TopRoutesWidget';
import DriverLeaderboardWidget from '../widgets/DriverLeaderboardWidget';
import ShiftCoverageWidget from '../widgets/ShiftCoverageWidget';
import FleetUtilWidget from '../widgets/FleetUtilWidget';
import RiderCohortsWidget from '../widgets/RiderCohortsWidget';

const DOW_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DashboardTab({ dateRange, userId, onSummaryData }) {
  const { layout, setLayout, saveLayout, saveCustomDefault, resetLayout } = useWidgetLayout(TAB_CONFIGS.dashboard, userId);
  const [editMode, setEditMode] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const visibleIds = layout.map(w => w.id);

  const loadData = useCallback(async () => {
    setLoading(true);
    const endpoints = [];
    const has = id => visibleIds.includes(id);

    if (has('kpi-grid')) endpoints.push('summary');
    if (has('kpi-grid') || has('ride-volume') || has('rides-by-dow') || has('rides-by-hour')) {
      // tardiness needed for KPI punctuality
    }
    endpoints.push('tardiness', 'fleet-utilization');
    if (has('ride-volume')) endpoints.push('ride-volume');
    if (has('ride-outcomes')) endpoints.push('ride-outcomes');
    if (has('peak-hours')) endpoints.push('peak-hours');
    if (has('rides-by-dow') || has('rides-by-hour')) endpoints.push('frequency');
    if (has('top-routes')) endpoints.push('routes');
    if (has('driver-leaderboard')) endpoints.push('driver-performance');
    if (has('shift-coverage')) endpoints.push('shift-coverage');
    if (has('rider-cohorts')) endpoints.push('rider-cohorts');

    const unique = [...new Set(endpoints)];
    const results = await fetchAllAnalytics(unique, dateRange, { noCache: false });

    // Also fetch ops config for DOW filtering
    let opsConfig = null;
    try { opsConfig = await fetchOpsConfig(); } catch (e) { /* ignore */ }

    // Transform frequency data for DOW/Hour widgets
    if (results.frequency) {
      const opDays = opsConfig?.operating_days
        ? String(opsConfig.operating_days).split(',').map(Number)
        : [0, 1, 2, 3, 4];
      const freq = results.frequency;

      if (freq.byDayOfWeek) {
        results._dowData = opDays.map(d => {
          const pgDow = (d + 1) % 7;
          const row = freq.byDayOfWeek.find(r => parseInt(r.dow) === pgDow);
          return { label: DOW_NAMES[pgDow], count: row ? row.count : 0 };
        });
      }
      if (freq.byHour) {
        results._hourData = freq.byHour
          .filter(r => parseInt(r.hour) >= 8 && parseInt(r.hour) <= 19)
          .map(r => {
            const h = parseInt(r.hour);
            const label = h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p';
            return { label, count: r.count };
          });
      }
    }

    setData(results);
    setLoading(false);
    if (results.summary && onSummaryData) onSummaryData(results.summary);
  }, [dateRange, visibleIds.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadData(); }, [loadData]);

  function handleLayoutChange(items) {
    setLayout(items);
    saveLayout(items);
  }

  function handleAddWidget(widgetId) {
    const def = WIDGET_REGISTRY[widgetId];
    if (!def) return;
    const defaultItem = TAB_CONFIGS.dashboard.defaultLayout.find(d => d.id === widgetId);
    const w = defaultItem ? defaultItem.w : 6;
    const h = defaultItem ? defaultItem.h : 4;
    const newLayout = [...layout, { id: widgetId, x: 0, y: 999, w, h }];
    setLayout(newLayout);
    saveLayout(newLayout);
    setLibraryOpen(false);
  }

  function handleRemoveWidget(widgetId) {
    const newLayout = layout.filter(w => w.id !== widgetId);
    setLayout(newLayout);
    saveLayout(newLayout);
  }

  function handleSetDefault() {
    saveCustomDefault();
  }

  function renderWidget(widgetId) {
    if (loading) return <SkeletonLoader type={WIDGET_REGISTRY[widgetId]?.skeletonType || 'chart'} />;

    switch (widgetId) {
      case 'kpi-grid':
        return <KPIGridWidget summaryData={data.summary} tardinessData={data.tardiness} fleetData={data['fleet-utilization']} />;
      case 'ride-volume':
        return <RideVolumeWidget data={data['ride-volume']} />;
      case 'ride-outcomes':
        return <RideOutcomesWidget data={data['ride-outcomes']} />;
      case 'peak-hours':
        return <PeakHoursWidget data={data['peak-hours']} />;
      case 'rides-by-dow':
        return <RidesByDOWWidget data={data._dowData} />;
      case 'rides-by-hour':
        return <RidesByHourWidget data={data._hourData} />;
      case 'top-routes':
        return <TopRoutesWidget routes={data.routes?.routes} />;
      case 'driver-leaderboard':
        return <DriverLeaderboardWidget drivers={data['driver-performance']?.drivers} />;
      case 'shift-coverage':
        return <ShiftCoverageWidget data={data['shift-coverage']} />;
      case 'fleet-utilization':
        return <FleetUtilWidget data={data['fleet-utilization']} />;
      case 'rider-cohorts':
        return <RiderCohortsWidget data={data['rider-cohorts']} />;
      default:
        return <SkeletonLoader type="chart" />;
    }
  }

  return (
    <div id="analytics-dashboard-view">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
        <WidgetToolbar
          editMode={editMode}
          onToggleEdit={() => { setEditMode(!editMode); if (editMode) setLibraryOpen(false); }}
          onAdd={() => setLibraryOpen(true)}
          onSetDefault={handleSetDefault}
          onReset={resetLayout}
        />
      </div>
      <WidgetGrid
        gridId="widget-grid"
        layout={layout}
        editMode={editMode}
        onLayoutChange={handleLayoutChange}
        onRemoveWidget={handleRemoveWidget}
        widgetRenderer={renderWidget}
      />
      <WidgetLibraryDrawer
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        visibleWidgetIds={visibleIds}
        allowedWidgets={TAB_CONFIGS.dashboard.allowedWidgets}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
