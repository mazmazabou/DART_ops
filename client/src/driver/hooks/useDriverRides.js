import { useMemo } from 'react';

function todayLocal() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useDriverRides(rides, userId) {
  return useMemo(() => {
    const today = todayLocal();
    const actionableStatuses = ['scheduled', 'driver_on_the_way', 'driver_arrived_grace'];
    const doneStatuses = ['completed', 'no_show'];

    const available = rides.filter(r =>
      r.status === 'approved' && !r.assignedDriverId && r.requestedTime?.startsWith(today)
    );

    const myActive = rides.filter(r =>
      r.assignedDriverId === userId &&
      r.requestedTime?.startsWith(today) &&
      actionableStatuses.includes(r.status)
    );

    // Hero: most urgent active ride
    const heroRide = myActive.find(r => r.status === 'driver_arrived_grace')
      || myActive.find(r => r.status === 'driver_on_the_way')
      || myActive.find(r => r.status === 'scheduled')
      || null;

    const upcoming = myActive.filter(r => r.id !== heroRide?.id);

    const completed = rides.filter(r =>
      r.assignedDriverId === userId &&
      r.requestedTime?.startsWith(today) &&
      doneStatuses.includes(r.status)
    );

    return { available, heroRide, upcoming, completed, activeRide: heroRide };
  }, [rides, userId]);
}
