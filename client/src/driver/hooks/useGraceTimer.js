import { useState, useEffect, useRef } from 'react';

export function useGraceTimer(graceStartTime, gracePeriodMinutes) {
  const totalSeconds = (gracePeriodMinutes || 5) * 60;
  const [remaining, setRemaining] = useState(() => {
    if (!graceStartTime) return totalSeconds;
    const elapsed = (Date.now() - new Date(graceStartTime).getTime()) / 1000;
    return Math.max(0, totalSeconds - elapsed);
  });
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!graceStartTime) return;

    const tick = () => {
      const elapsed = (Date.now() - new Date(graceStartTime).getTime()) / 1000;
      setRemaining(Math.max(0, totalSeconds - elapsed));
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [graceStartTime, totalSeconds]);

  const expired = remaining <= 0;
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  const fraction = totalSeconds > 0 ? remaining / totalSeconds : 0;

  return { remaining, expired, mins, secs, fraction };
}
