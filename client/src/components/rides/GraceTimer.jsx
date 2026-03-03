import { useState, useEffect } from 'react';

export default function GraceTimer({ graceStartTime, gracePeriodMinutes }) {
  const graceMins = Math.round(Number(gracePeriodMinutes || 5));
  const GRACE_MS = graceMins * 60 * 1000;
  const circumference = 2 * Math.PI * 54;

  const [remaining, setRemaining] = useState(() => {
    const elapsed = Date.now() - new Date(graceStartTime).getTime();
    return Math.max(0, GRACE_MS - elapsed);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - new Date(graceStartTime).getTime();
      const rem = Math.max(0, GRACE_MS - elapsed);
      setRemaining(rem);
      if (rem <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [graceStartTime, GRACE_MS]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const fraction = remaining / GRACE_MS;
  const offset = circumference * (1 - fraction);

  return (
    <div className="grace-timer" id="grace-timer-container">
      <div className="grace-timer__circle">
        <svg viewBox="0 0 120 120">
          <circle className="bg" cx="60" cy="60" r="54" />
          <circle
            className="progress"
            id="grace-progress"
            cx="60"
            cy="60"
            r="54"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="grace-timer__time" id="grace-time-display">
          {mins}:{String(secs).padStart(2, '0')}
        </div>
      </div>
      <div className="grace-timer__label">Your driver is waiting</div>
    </div>
  );
}
