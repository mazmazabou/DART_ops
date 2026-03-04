import React, { useMemo } from 'react';
import { resolveColor } from '../constants';

/**
 * AttendanceKPIsWidget -- 5 KPI cards for attendance summary.
 *
 * @param {{ summary: { totalClockIns: number, onTimeCount: number, tardyCount: number,
 *           avgTardinessMinutes: number, totalMissedShifts: number } }} props
 */
export default function AttendanceKPIsWidget({ summary }) {
  const {
    totalClockIns = 0,
    onTimeCount = 0,
    tardyCount = 0,
    avgTardinessMinutes = 0,
    totalMissedShifts = 0,
  } = summary || {};

  const onTimeRate = totalClockIns > 0 ? ((onTimeCount / totalClockIns) * 100) : 0;

  const cards = useMemo(() => {
    // On-time rate color thresholds
    let rateColor, rateClass;
    if (onTimeRate >= 90) {
      rateColor = resolveColor('var(--status-completed)') || '#2fb344';
      rateClass = 'good';
    } else if (onTimeRate >= 80) {
      rateColor = resolveColor('var(--status-on-the-way)') || '#f59f00';
      rateClass = 'warning';
    } else {
      rateColor = resolveColor('var(--status-no-show)') || '#d63939';
      rateClass = 'danger';
    }

    // Tardy color
    const tardyClass = tardyCount === 0 ? 'good' : 'danger';

    // Missed shifts color
    let missedClass;
    if (totalMissedShifts === 0) missedClass = 'good';
    else if (totalMissedShifts <= 3) missedClass = 'warning';
    else missedClass = 'danger';

    return { rateColor, rateClass, tardyClass, missedClass };
  }, [onTimeRate, tardyCount, totalMissedShifts]);

  const ringGradient = `conic-gradient(${cards.rateColor} ${onTimeRate * 3.6}deg, #e9ecef ${onTimeRate * 3.6}deg)`;

  return (
    <div className="att-kpi-grid">
      {/* Total Clock-Ins */}
      <div className="kpi-card kpi-card--primary">
        <div className="kpi-value">{totalClockIns}</div>
        <div className="kpi-label">
          <i className="ti ti-clock" style={{ marginRight: 4 }}></i>
          Total Clock-Ins
        </div>
      </div>

      {/* On-Time Rate with conic-gradient ring */}
      <div className={`kpi-card kpi-card--${cards.rateClass}`}>
        <div className="kpi-value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            className="att-ontime-ring"
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: ringGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--card-bg, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700,
              }}
            >
              {onTimeRate.toFixed(0)}%
            </div>
          </div>
          <span>{onTimeRate.toFixed(1)}%</span>
        </div>
        <div className="kpi-label">
          <i className="ti ti-circle-check" style={{ marginRight: 4 }}></i>
          On-Time Rate
        </div>
      </div>

      {/* Tardy Count */}
      <div className={`kpi-card kpi-card--${cards.tardyClass}`}>
        <div className="kpi-value">{tardyCount}</div>
        <div className="kpi-label">
          <i className="ti ti-clock-exclamation" style={{ marginRight: 4 }}></i>
          Tardy Count
        </div>
      </div>

      {/* Avg Tardiness */}
      <div className="kpi-card">
        <div className="kpi-value">{avgTardinessMinutes.toFixed(1)}m</div>
        <div className="kpi-label">
          <i className="ti ti-hourglass" style={{ marginRight: 4 }}></i>
          Avg Tardiness
        </div>
      </div>

      {/* Missed Shifts */}
      <div className={`kpi-card kpi-card--${cards.missedClass}`}>
        <div className="kpi-value">{totalMissedShifts}</div>
        <div className="kpi-label">
          <i className="ti ti-calendar-off" style={{ marginRight: 4 }}></i>
          Missed Shifts
        </div>
      </div>
    </div>
  );
}
