import React, { useMemo } from 'react';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

function hexToRgbArray(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  const n = parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export default function PeakHoursWidget({ data }) {
  const palette = getCampusPalette(getCampusSlug());
  const baseColor = palette[0] || '#4682B4';
  const rgb = useMemo(() => hexToRgbArray(baseColor), [baseColor]);

  if (!data || !data.grid || data.grid.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-flame" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No peak hours data available
      </div>
    );
  }

  const { grid, maxCount, operatingHours } = data;
  const startHour = operatingHours?.start != null ? parseInt(operatingHours.start, 10) : 0;
  const endHour = operatingHours?.end != null ? parseInt(operatingHours.end, 10) : 23;

  // Build hours range
  const hours = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  function formatHour(h) {
    if (h === 0) return '12 AM';
    if (h < 12) return h + ' AM';
    if (h === 12) return '12 PM';
    return (h - 12) + ' PM';
  }

  function getCellValue(hour, dayIdx) {
    const row = grid.find((r) => r.hour === hour);
    if (!row || !row.days) return 0;
    return row.days[dayIdx] || 0;
  }

  function getCellStyle(count) {
    if (maxCount === 0 || count === 0) {
      return { backgroundColor: 'transparent' };
    }
    const opacity = Math.max(0.08, count / maxCount);
    return {
      backgroundColor: 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + opacity.toFixed(2) + ')',
    };
  }

  return (
    <div style={{ overflowX: 'auto', fontSize: '0.8rem' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead>
          <tr>
            <th style={{ padding: '0.25rem 0.5rem', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-muted, #6b7280)', fontSize: '0.7rem' }}>
              Hour
            </th>
            {DAY_LABELS.map((day) => (
              <th key={day} style={{ padding: '0.25rem 0.5rem', fontWeight: 600, color: 'var(--color-text-muted, #6b7280)', fontSize: '0.7rem' }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((h) => (
            <tr key={h}>
              <td style={{ padding: '0.2rem 0.5rem', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--color-text-muted, #6b7280)', fontSize: '0.7rem' }}>
                {formatHour(h)}
              </td>
              {DAY_LABELS.map((_, dayIdx) => {
                const count = getCellValue(h, dayIdx);
                return (
                  <td
                    key={dayIdx}
                    style={{
                      padding: '0.2rem',
                      minWidth: '2.5rem',
                      borderRadius: '3px',
                      fontWeight: count > 0 ? 600 : 400,
                      color: count > 0 ? 'var(--color-text, #1f2937)' : 'var(--color-text-muted, #d1d5db)',
                      ...getCellStyle(count),
                    }}
                    title={DAY_LABELS[dayIdx] + ' ' + formatHour(h) + ': ' + count + ' rides'}
                  >
                    {count}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-text-muted, #6b7280)' }}>
        <span>Low</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0.1, 0.25, 0.45, 0.65, 0.85].map((op) => (
            <div
              key={op}
              style={{
                width: '18px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + op + ')',
              }}
            />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
