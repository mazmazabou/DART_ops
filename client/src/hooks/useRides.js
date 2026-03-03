import { useState, useCallback } from 'react';
import { usePolling } from './usePolling';
import { fetchMyRides } from '../api';
import { isActiveStatus, isTerminalStatus } from '../utils/status';

export function useRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMyRides();
      setRides(data);
    } catch {
      setRides([]);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, []);

  usePolling(refresh, 5000);

  const activeRides = rides
    .filter(r => isActiveStatus(r.status))
    .sort((a, b) => new Date(a.requestedTime) - new Date(b.requestedTime));

  const terminalRides = rides
    .filter(r => isTerminalStatus(r.status))
    .sort((a, b) => new Date(b.requestedTime) - new Date(a.requestedTime));

  return { rides, activeRides, terminalRides, loading, initialLoadDone, refresh };
}
