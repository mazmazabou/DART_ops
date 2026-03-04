const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'ti-chart-bar' },
  { id: 'hotspots', label: 'Hotspots', icon: 'ti-map-pin' },
  { id: 'milestones', label: 'Milestones', icon: 'ti-trophy' },
  { id: 'attendance', label: 'Attendance', icon: 'ti-clock-check' },
  { id: 'reports', label: 'Reports', icon: 'ti-report-analytics' },
];

export default function AnalyticsTabBar({ activeTab, onTabChange }) {
  return (
    <div className="analytics-tab-bar" style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border-light)', marginBottom: '16px' }}>
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`ro-btn ro-btn--ghost ro-btn--sm${activeTab === tab.id ? ' active' : ''}`}
          data-analytics-tab={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={{
            borderBottom: activeTab === tab.id ? '2px solid var(--color-primary)' : '2px solid transparent',
            borderRadius: '4px 4px 0 0',
            fontWeight: activeTab === tab.id ? 600 : 400,
          }}
        >
          <i className={`ti ${tab.icon}`} style={{ marginRight: '4px' }}></i>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
