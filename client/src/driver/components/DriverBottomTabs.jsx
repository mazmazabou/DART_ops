const TABS = [
  { id: 'home-panel', icon: 'ti ti-home', label: 'Home' },
  { id: 'rides-panel', icon: 'ti ti-road', label: 'My Rides' },
  { id: 'map-panel', icon: 'ti ti-map-2', label: 'Map' },
  { id: 'account-panel', icon: 'ti ti-user', label: 'Account' },
];

export default function DriverBottomTabs({ activeTab, onTabChange }) {
  return (
    <nav className="ro-bottom-tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`ro-bottom-tab${activeTab === tab.id ? ' active' : ''}`}
          data-target={tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={tab.icon} />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
