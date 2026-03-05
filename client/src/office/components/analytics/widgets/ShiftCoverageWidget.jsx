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
      <div className="ro-empty ao-empty">
        <i className="ti ti-calendar-stats ao-empty-icon" />
        No shift coverage data available
      </div>
    );
  }

  return (
    <div>
      {/* Summary stats */}
      <div className="ao-summary-row" style={{ marginBottom: '0.75rem' }}>
        <div>
          <span className="ao-metric-label">Coverage Rate</span>
          <div className="ao-metric-value">{(totals.coverageRate || 0).toFixed(1)}%</div>
        </div>
        <div>
          <span className="ao-metric-label">Scheduled Hours</span>
          <div className="ao-metric-value">{(totals.scheduledHours || 0).toFixed(1)}</div>
        </div>
        <div>
          <span className="ao-metric-label">Actual Hours</span>
          <div className="ao-metric-value">{(totals.actualHours || 0).toFixed(1)}</div>
        </div>
        <div>
          <span className="ao-metric-label">Rides Completed</span>
          <div className="ao-metric-value">{(totals.totalCompletedRides || 0).toLocaleString()}</div>
        </div>
      </div>

      {/* Daily table */}
      <div className="ao-table-wrap">
        <table className="ao-table">
          <thead>
            <tr>
              <th className="ao-th" onClick={() => handleSort('date')}>
                Date{sortIcon('date')}
              </th>
              <th className="ao-th ao-th--right" onClick={() => handleSort('scheduledHours')}>
                Scheduled{sortIcon('scheduledHours')}
              </th>
              <th className="ao-th ao-th--right" onClick={() => handleSort('actualHours')}>
                Actual{sortIcon('actualHours')}
              </th>
              <th className="ao-th ao-th--right" onClick={() => handleSort('gapHours')}>
                Gap{sortIcon('gapHours')}
              </th>
              <th className="ao-th ao-th--right" onClick={() => handleSort('completedRides')}>
                Rides{sortIcon('completedRides')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.date}>
                <td className="ao-td ao-td--compact">{formatDate(row.date)}</td>
                <td className="ao-td ao-td--compact ao-td--right">{(row.scheduledHours || 0).toFixed(1)}</td>
                <td className="ao-td ao-td--compact ao-td--right">{(row.actualHours || 0).toFixed(1)}</td>
                <td className="ao-td ao-td--compact ao-td--right ao-td--bold" style={gapStyle(row.gapHours)}>
                  {(row.gapHours || 0) > 0 ? '+' : ''}{(row.gapHours || 0).toFixed(1)}
                </td>
                <td className="ao-td ao-td--compact ao-td--right">{row.completedRides || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
