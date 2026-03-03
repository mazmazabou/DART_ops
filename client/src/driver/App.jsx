import { useState } from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { TenantProvider } from '../contexts/TenantContext';
import { ToastProvider } from '../contexts/ToastContext';
import { ModalProvider } from '../components/ui/Modal';
import { useOpsConfig } from '../hooks/useOpsConfig';
import { useDriverData } from './hooks/useDriverData';
import { useClockStatus } from './hooks/useClockStatus';
import { useDriverRides } from './hooks/useDriverRides';
import DriverHeader from './components/DriverHeader';
import DriverBottomTabs from './components/DriverBottomTabs';
import HomePanel from './components/HomePanel';
import RidesPanel from './components/RidesPanel';
import MapPanel from './components/MapPanel';
import AccountPanel from './components/AccountPanel';

function DriverApp() {
  const { user } = useAuth();
  const { opsConfig } = useOpsConfig();
  const { employees, rides, vehicles, refresh } = useDriverData();
  const { isActive, employee } = useClockStatus(employees, user?.id);
  const { available, heroRide, upcoming, completed, activeRide } = useDriverRides(rides, user?.id);
  const [activeTab, setActiveTab] = useState('home-panel');

  const gracePeriodMinutes = Number(opsConfig?.grace_period_minutes || 5);

  return (
    <>
      <DriverHeader />
      <main className="driver-main">
        <div id="home-panel" className={`tab-panel${activeTab === 'home-panel' ? ' active' : ''}`}>
          <div id="home-content">
            <HomePanel
              isActive={isActive}
              employee={employee}
              rides={rides}
              vehicles={vehicles}
              userId={user?.id}
              available={available}
              onRefresh={refresh}
            />
          </div>
        </div>
        <div id="rides-panel" className={`tab-panel${activeTab === 'rides-panel' ? ' active' : ''}`}>
          <div id="rides-content">
            <RidesPanel
              heroRide={heroRide}
              upcoming={upcoming}
              completed={completed}
              vehicles={vehicles}
              gracePeriodMinutes={gracePeriodMinutes}
              onRefresh={refresh}
            />
          </div>
        </div>
        <div id="map-panel" className={`tab-panel${activeTab === 'map-panel' ? ' active' : ''}`}>
          <div id="map-content">
            <MapPanel activeRide={activeRide} isVisible={activeTab === 'map-panel'} />
          </div>
        </div>
        <div id="account-panel" className={`tab-panel${activeTab === 'account-panel' ? ' active' : ''}`}>
          <AccountPanel />
        </div>
      </main>
      <DriverBottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <ModalProvider>
        <AuthProvider expectedRole="driver">
          <TenantProvider roleLabel="Driver">
            <DriverApp />
          </TenantProvider>
        </AuthProvider>
      </ModalProvider>
    </ToastProvider>
  );
}
