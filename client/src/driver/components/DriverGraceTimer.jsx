import { useGraceTimer } from '../hooks/useGraceTimer';

const CIRCUMFERENCE = 452.4; // 2 * PI * 72

export default function DriverGraceTimer({ graceStartTime, gracePeriodMinutes }) {
  const { expired, mins, secs, fraction } = useGraceTimer(graceStartTime, gracePeriodMinutes);
  const offset = CIRCUMFERENCE * (1 - fraction);

  return (
    <div className={`grace-timer${expired ? ' expired' : ''}`} data-grace={graceStartTime}>
      <div className="grace-timer__circle">
        <svg viewBox="0 0 160 160">
          <circle className="bg" cx="80" cy="80" r="72" />
          <circle
            className="progress"
            cx="80" cy="80" r="72"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={expired ? { stroke: 'var(--status-no-show)' } : undefined}
          />
        </svg>
        <div className="grace-timer__time">
          {mins}:{String(secs).padStart(2, '0')}
        </div>
      </div>
      <div className="grace-timer__label">
        {expired ? 'Grace period expired' : 'Waiting for rider'}
      </div>
    </div>
  );
}
