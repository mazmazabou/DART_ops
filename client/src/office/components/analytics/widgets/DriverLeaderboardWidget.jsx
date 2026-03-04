import React, { useState, useMemo } from 'react';

function getRateStyle(rate) {
  if (rate >= 85) return { color: '#2fb344' };
  if (rate >= 70) return { color: '#f59f00' };
  return { color: '#d63939' };
}

export default function DriverLeaderboardWidget({ drivers }) {
  const [sortKey, setSortKey] = useState('completed');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!drivers || drivers.length === 0) return [];
    return [...drivers].sort((a, b) => {
      const av = a[sortKey] || 0;
      const bv = b[sortKey] || 0;
      return sortAsc ? av - bv : bv - av;
    });
  }, [drivers, sortKey, sortAsc]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function sortIcon(key) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-steering-wheel" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No driver data available
      </div>
    );
  }

  const thStyle = {
    padding: '0.5rem 0.75rem',
    textAlign: 'left',
    fontWeight: 600,
    fontSize: '0.75rem',
    color: 'var(--color-text-muted, #6b7280)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    userSelect: 'none',
    borderBottom: '2px solid var(--color-border, #e5e7eb)',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '0.5rem 0.75rem',
    fontSize: '0.85rem',
    borderBottom: '1px solid var(--color-border, #e5e7eb)',
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={thStyle} onClick={() => handleSort('driverName')}>
              Driver{sortIcon('driverName')}
            </th>
            <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('completed')}>
              Rides{sortIcon('completed')}
            </th>
            <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('completionRate')}>
              Completion{sortIcon('completionRate')}
            </th>
            <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('punctualityRate')}>
              On-Time{sortIcon('punctualityRate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((driver, i) => (
            <tr key={i}>
              <td style={{ ...tdStyle, fontWeight: 500 }}>
                {driver.driverName || 'Unknown'}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                {(driver.completed || 0).toLocaleString()}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, ...getRateStyle(driver.completionRate || 0) }}>
                {(driver.completionRate || 0).toFixed(1)}%
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, ...getRateStyle(driver.punctualityRate || 0) }}>
                {(driver.punctualityRate || 0).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
