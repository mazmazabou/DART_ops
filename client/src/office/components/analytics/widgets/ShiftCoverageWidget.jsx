import React, { useState, useMemo } from 'react';

export default function ShiftCoverageWidget({ data }) {
  const [sortKey, setSortKey] = useState('date');
  const [sortAsc, setSortAsc] = useState(true);

  const daily = data?.daily || [];
  const totals = data?.totals || {};

  const sorted = useMemo(() => {
    if (daily.length === 0) return [];
    return [...daily].sort((a, b) => {
      if (sortKey === 'date') {
        return sortAsc
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date);
      }
      const av = a[sortKey] || 0;
      const bv = b[sortKey] || 0;
      return sortAsc ? av - bv : bv - av;
    });
  }, [daily, sortKey, sortAsc]);

  function handleSort(key) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === 'date');
    }
  }

  function sortIcon(key) {
    if (sortKey !== key) return '';
    return sortAsc ? ' \u25B2' : ' \u25BC';
  }

  function formatDate(dateStr) {
    const dt = new Date(dateStr + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
  }

  function gapStyle(gap) {
    if (gap == null || gap === 0) return {};
    if (gap > 0) return { color: '#d63939' };
    return { color: '#2fb344' };
  }

  if (!data || daily.length === 0) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-calendar-stats" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No shift coverage data available
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
    padding: '0.4rem 0.75rem',
    fontSize: '0.85rem',
    borderBottom: '1px solid var(--color-border, #e5e7eb)',
  };

  return (
    <div>
      {/* Summary stats */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted, #6b7280)', letterSpacing: '0.04em' }}>Coverage Rate</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{(totals.coverageRate || 0).toFixed(1)}%</div>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted, #6b7280)', letterSpacing: '0.04em' }}>Scheduled Hours</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{(totals.scheduledHours || 0).toFixed(1)}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted, #6b7280)', letterSpacing: '0.04em' }}>Actual Hours</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{(totals.actualHours || 0).toFixed(1)}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted, #6b7280)', letterSpacing: '0.04em' }}>Rides Completed</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{(totals.totalCompletedRides || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Daily table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('date')}>
                Date{sortIcon('date')}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('scheduledHours')}>
                Scheduled{sortIcon('scheduledHours')}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('actualHours')}>
                Actual{sortIcon('actualHours')}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('gapHours')}>
                Gap{sortIcon('gapHours')}
              </th>
              <th style={{ ...thStyle, textAlign: 'right' }} onClick={() => handleSort('completedRides')}>
                Rides{sortIcon('completedRides')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.date}>
                <td style={tdStyle}>{formatDate(row.date)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{(row.scheduledHours || 0).toFixed(1)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{(row.actualHours || 0).toFixed(1)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, ...gapStyle(row.gapHours) }}>
                  {(row.gapHours || 0) > 0 ? '+' : ''}{(row.gapHours || 0).toFixed(1)}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>{row.completedRides || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
