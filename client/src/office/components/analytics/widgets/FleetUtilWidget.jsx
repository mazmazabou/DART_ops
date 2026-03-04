import React, { useMemo } from 'react';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

export default function FleetUtilWidget({ data }) {
  const palette = getCampusPalette(getCampusSlug());
  const vehicles = data?.vehicles || [];
  const summary = data?.summary || {};

  const activeVehicles = useMemo(() => {
    return vehicles.filter((v) => v.status !== 'retired');
  }, [vehicles]);

  const maxRides = useMemo(() => {
    if (activeVehicles.length === 0) return 1;
    return Math.max(1, ...activeVehicles.map((v) => v.totalRides || 0));
  }, [activeVehicles]);

  if (!data || activeVehicles.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-bus" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No fleet utilization data available
      </div>
    );
  }

  // Sort by totalRides descending
  const sorted = [...activeVehicles].sort((a, b) => (b.totalRides || 0) - (a.totalRides || 0));

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {sorted.map((vehicle, i) => {
          const rides = vehicle.totalRides || 0;
          const pct = maxRides > 0 ? (rides / maxRides) * 100 : 0;
          const color = palette[i % palette.length];

          return (
            <div key={vehicle.name + '-' + i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '100px', flexShrink: 0, fontSize: '0.8rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={vehicle.name}>
                {vehicle.name}
              </div>
              <div style={{ flex: 1, height: '20px', backgroundColor: 'var(--color-border, #e5e7eb)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div
                  style={{
                    height: '100%',
                    width: pct + '%',
                    backgroundColor: color,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                    minWidth: rides > 0 ? '4px' : '0',
                  }}
                />
              </div>
              <div style={{ width: '40px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 600, flexShrink: 0 }}>
                {rides}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border, #e5e7eb)', fontSize: '0.8rem', color: 'var(--color-text-muted, #6b7280)', flexWrap: 'wrap' }}>
        <span>Total Fleet: <strong style={{ color: 'var(--color-text, #1f2937)' }}>{summary.totalFleet || 0}</strong></span>
        <span>Available: <strong style={{ color: '#2fb344' }}>{summary.available || 0}</strong></span>
        {summary.overdueCount > 0 && (
          <span>Overdue Maintenance: <strong style={{ color: '#d63939' }}>{summary.overdueCount}</strong></span>
        )}
      </div>
    </div>
  );
}
