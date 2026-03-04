import React from 'react';

function getCompletionClass(rate) {
  if (rate >= 85) return 'kpi-card--good';
  if (rate >= 70) return 'kpi-card--warning';
  return 'kpi-card--danger';
}

function getNoShowClass(rate) {
  if (rate <= 5) return 'kpi-card--good';
  if (rate <= 15) return 'kpi-card--warning';
  return 'kpi-card--danger';
}

function getPunctualityClass(rate) {
  if (rate >= 90) return 'kpi-card--good';
  if (rate >= 80) return 'kpi-card--warning';
  return 'kpi-card--danger';
}

export default function KPIGridWidget({ summaryData, tardinessData, fleetData }) {
  const summary = summaryData || {};
  const tardiness = tardinessData?.summary || {};
  const fleet = fleetData?.summary || {};

  const totalRides = summary.totalRides || 0;
  const completionRate = totalRides > 0
    ? ((summary.completed || 0) / totalRides * 100)
    : 0;
  const noShowRate = totalRides > 0
    ? ((summary.noShows || 0) / totalRides * 100)
    : 0;
  const activeRiders = summary.activeRiders || 0;

  const totalClockIns = tardiness.totalClockIns || 0;
  const tardyCount = tardiness.tardyCount || 0;
  const punctualityRate = totalClockIns > 0
    ? ((totalClockIns - tardyCount) / totalClockIns * 100)
    : 100;

  const totalFleet = fleet.totalFleet || 0;
  const available = fleet.available || 0;

  const cards = [
    {
      label: 'Total Rides',
      value: totalRides.toLocaleString(),
      icon: 'ti ti-car',
      className: 'kpi-card--neutral',
    },
    {
      label: 'Completion Rate',
      value: completionRate.toFixed(1) + '%',
      icon: 'ti ti-circle-check',
      className: getCompletionClass(completionRate),
    },
    {
      label: 'No-Show Rate',
      value: noShowRate.toFixed(1) + '%',
      icon: 'ti ti-user-x',
      className: getNoShowClass(noShowRate),
    },
    {
      label: 'Active Riders',
      value: activeRiders.toLocaleString(),
      icon: 'ti ti-users',
      className: 'kpi-card--neutral',
    },
    {
      label: 'Driver Punctuality',
      value: punctualityRate.toFixed(1) + '%',
      icon: 'ti ti-clock-check',
      className: getPunctualityClass(punctualityRate),
    },
    {
      label: 'Fleet Available',
      value: available + ' / ' + totalFleet,
      icon: 'ti ti-bus',
      className: 'kpi-card--neutral',
    },
  ];

  return (
    <div className="kpi-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      {cards.map((card) => (
        <div
          key={card.label}
          className={'kpi-card ' + card.className}
          style={{
            flex: '1 1 calc(16.666% - 0.75rem)',
            minWidth: '140px',
            padding: '1rem',
            borderRadius: '0.5rem',
            background: 'var(--color-card-bg, #fff)',
            border: '1px solid var(--color-border, #e5e7eb)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <i className={card.icon} style={{ fontSize: '1.25rem', opacity: 0.7 }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
