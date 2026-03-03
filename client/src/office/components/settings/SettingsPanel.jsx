import { useState, useCallback } from 'react';
import UsersSubPanel from './UsersSubPanel';
import BusinessRulesSubPanel from './BusinessRulesSubPanel';
import NotifSettingsSubPanel from './NotifSettingsSubPanel';
import GuidelinesSubPanel from './GuidelinesSubPanel';
import DataSubPanel from './DataSubPanel';
import AcademicTermsSubPanel from './AcademicTermsSubPanel';

const SUB_TABS = [
  { id: 'admin-users-view', label: 'Users' },
  { id: 'admin-rules-view', label: 'Business Rules' },
  { id: 'notif-settings', label: 'Notifications' },
  { id: 'admin-guidelines-view', label: 'Program Guidelines' },
  { id: 'admin-data-view', label: 'Data Management' },
  { id: 'admin-terms-view', label: 'Academic Terms' },
];

export default function SettingsPanel() {
  const [activeSubTab, setActiveSubTab] = useState('admin-users-view');
  const [loadedTabs, setLoadedTabs] = useState({ 'admin-users-view': true });

  const handleTabChange = useCallback((tabId) => {
    setActiveSubTab(tabId);
    setLoadedTabs(prev => ({ ...prev, [tabId]: true }));
  }, []);

  return (
    <>
      <div className="ro-tabs">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            className={`ro-tab${activeSubTab === tab.id ? ' active' : ''}`}
            data-subtarget={tab.id}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="admin-users-view" className={`sub-panel${activeSubTab === 'admin-users-view' ? ' active' : ''}`}>
        {loadedTabs['admin-users-view'] && <UsersSubPanel />}
      </div>
      <div id="admin-rules-view" className={`sub-panel${activeSubTab === 'admin-rules-view' ? ' active' : ''}`}>
        {loadedTabs['admin-rules-view'] && <BusinessRulesSubPanel />}
      </div>
      <div id="notif-settings" className={`sub-panel${activeSubTab === 'notif-settings' ? ' active' : ''}`}>
        {loadedTabs['notif-settings'] && <NotifSettingsSubPanel />}
      </div>
      <div id="admin-guidelines-view" className={`sub-panel${activeSubTab === 'admin-guidelines-view' ? ' active' : ''}`}>
        {loadedTabs['admin-guidelines-view'] && <GuidelinesSubPanel />}
      </div>
      <div id="admin-data-view" className={`sub-panel${activeSubTab === 'admin-data-view' ? ' active' : ''}`}>
        {loadedTabs['admin-data-view'] && <DataSubPanel />}
      </div>
      <div id="admin-terms-view" className={`sub-panel${activeSubTab === 'admin-terms-view' ? ' active' : ''}`}>
        {loadedTabs['admin-terms-view'] && <AcademicTermsSubPanel />}
      </div>
    </>
  );
}
