import React, { useState, useMemo } from 'react';

function getCompletionStyle(rate) {
  if (rate >= 85) return { color: '#2fb344' };
  if (rate >= 70) return { color: '#f59f00' };
  return { color: '#d63939' };
}

export default function TopRoutesWidget({ routes }) {
  const [sortKey, setSortKey] = useState('total');
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = useMemo(() => {
    if (!routes || routes.length === 0) return [];
    const top = routes.slice(0, 10);
    return [...top].sort((a, b) => {
      const av = a[sortKey] || 0;
      const bv = b[sortKey] || 0;
      return sortAsc ? av - bv : bv - av;
    });
  }, [routes, sortKey, sortAsc]);

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

  if (!routes || routes.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-route" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No route data available
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
            <th style={thStyle}>Route</th>
            <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('total')}>
              Rides{sortIcon('total')}
            </th>
            <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('completionRate')}>
              Completion{sortIcon('completionRate')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((route, i) => (
            <tr key={i}>
              <td style={tdStyle}>
                <span style={{ fontWeight: 500 }}>{route.pickupLocation}</span>
                <span style={{ color: 'var(--color-text-muted, #6b7280)', margin: '0 0.25rem' }}>&rarr;</span>
                <span>{route.dropoffLocation}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600 }}>
                {(route.total || 0).toLocaleString()}
              </td>
              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, ...getCompletionStyle(route.completionRate || 0) }}>
                {(route.completionRate || 0).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
