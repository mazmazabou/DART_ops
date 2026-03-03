const TABS = [
  { id: 'book-panel', icon: 'ti ti-plus', label: 'Book' },
  { id: 'myrides-panel', icon: 'ti ti-list', label: 'My Rides' },
  { id: 'history-panel', icon: 'ti ti-clock-hour-3', label: 'History' },
];

export default function BottomTabs({ activeTab, onTabChange, hideBook }) {
  return (
    <nav className="ro-bottom-tabs">
      {TABS.map(tab => {
        if (tab.id === 'book-panel' && hideBook) return null;
        return (
          <button
            key={tab.id}
            className={`ro-bottom-tab${activeTab === tab.id ? ' active' : ''}`}
            data-target={tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={tab.icon} />
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
