import { useState, useEffect } from 'react';
import { fetchAnalytics, downloadExcelReport } from '../hooks/useAnalyticsFetch';
import { REPORT_SHEETS } from '../constants';
import { useToast } from '../../../../contexts/ToastContext';

export default function ReportsTab({ dateRange }) {
  const { showToast } = useToast();
  const [reportType, setReportType] = useState('full');
  const [semesterData, setSemesterData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAnalytics('semester-report', {}).then(setSemesterData).catch(() => {});
    fetchAnalytics('summary', dateRange).then(setSummaryData).catch(() => {});
  }, [dateRange]);

  async function handleDownload() {
    setDownloading(true);
    try {
      const fname = 'rideops-report-' + (dateRange.from || 'all') + '-to-' + (dateRange.to || 'now') + '.xlsx';
      await downloadExcelReport(dateRange, fname);
      showToast('Report downloaded successfully', 'success');
    } catch (e) {
      showToast('Failed to download report', 'error');
    }
    setDownloading(false);
  }

  function fmtDate(s) {
    if (!s) return '';
    return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function delta(curr, prev) {
    if (!prev || prev === 0) return null;
    const diff = curr - prev;
    if (diff === 0) return null;
    const isUp = diff > 0;
    const formatted = Number.isInteger(diff) ? Math.abs(diff) : parseFloat(Math.abs(diff).toFixed(2));
    return (
      <span className={`delta delta--${isUp ? 'up' : 'down'}`}>
        <i className={`ti ${isUp ? 'ti-arrow-up' : 'ti-arrow-down'}`}></i>{formatted}
      </span>
    );
  }

  function StatBlock({ stats, label, prevStats }) {
    return (
      <div className="semester-period">
        <h4>{label}</h4>
        <div className="semester-stat">
          <div className="stat-value">{stats.completedRides}{prevStats && delta(stats.completedRides, prevStats.completedRides)}</div>
          <div className="stat-label">Rides Completed</div>
        </div>
        <div className="semester-stat">
          <div className="stat-value">{stats.peopleHelped ?? 0}{prevStats && delta(stats.peopleHelped ?? 0, prevStats.peopleHelped ?? 0)}</div>
          <div className="stat-label">People Helped</div>
        </div>
        <div className="semester-stat">
          <div className="stat-value">{stats.completionRate}%{prevStats && delta(stats.completionRate, prevStats.completionRate)}</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="semester-stat">
          <div className="stat-value">{stats.noShows}{prevStats && delta(stats.noShows, prevStats.noShows)}</div>
          <div className="stat-label">No-Shows</div>
        </div>
      </div>
    );
  }

  const info = REPORT_SHEETS[reportType] || REPORT_SHEETS.full;
  const dateLabel = dateRange.from && dateRange.to
    ? fmtDate(dateRange.from) + ' \u2013 ' + fmtDate(dateRange.to)
    : dateRange.from ? 'From ' + fmtDate(dateRange.from) : '';

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Semester Comparison */}
      {semesterData && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Semester Comparison</h3>
          <div className="semester-comparison">
            <StatBlock stats={semesterData.previous} label={semesterData.previousLabel + ' (Previous)'} />
            <StatBlock stats={semesterData.current} label={semesterData.semesterLabel + ' (Current)'} prevStats={semesterData.previous} />
          </div>

          {/* RideOps Wrapped */}
          {semesterData.current && (
            <div className="ro-wrapped" style={{ marginTop: '16px' }}>
              <div className="wrapped-grid">
                <div className="wrapped-card">
                  <div className="wrapped-card__icon"><i className="ti ti-road"></i></div>
                  <div className="wrapped-card__value">{semesterData.current.completedRides}</div>
                  <div className="wrapped-card__label">Rides Completed</div>
                </div>
                <div className="wrapped-card">
                  <div className="wrapped-card__icon"><i className="ti ti-users"></i></div>
                  <div className="wrapped-card__value">{semesterData.current.peopleHelped ?? 0}</div>
                  <div className="wrapped-card__label">People Helped</div>
                </div>
                <div className="wrapped-card">
                  <div className="wrapped-card__icon"><i className="ti ti-percentage"></i></div>
                  <div className="wrapped-card__value">{semesterData.current.completedRides > 0 ? semesterData.current.completionRate + '%' : '\u2014'}</div>
                  <div className="wrapped-card__label">Completion Rate</div>
                </div>
                <div className="wrapped-card">
                  <div className="wrapped-card__icon"><i className="ti ti-star"></i></div>
                  <div className="wrapped-card__value">
                    {semesterData.driverLeaderboard?.[0]?.name || '\u2014'}
                  </div>
                  <div className="wrapped-card__label">
                    {semesterData.driverLeaderboard?.[0] ? `MVP \u00B7 ${semesterData.driverLeaderboard[0].completed} rides` : 'MVP Driver'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monthly Breakdown */}
          {semesterData.monthlyBreakdown?.length > 0 && (
            <>
              <h4 style={{ marginTop: '16px' }}>Monthly Breakdown</h4>
              <table className="grid-table">
                <thead><tr><th>Month</th><th>Completed</th><th>Total</th><th>Riders</th></tr></thead>
                <tbody>
                  {semesterData.monthlyBreakdown.map(m => (
                    <tr key={m.month}>
                      <td>{new Date(m.month + '-01T12:00:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</td>
                      <td>{m.completed}</td>
                      <td>{m.total}</td>
                      <td>{m.riders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Driver Leaderboard */}
          {semesterData.driverLeaderboard?.length > 0 && (
            <>
              <h4 style={{ marginTop: '16px' }}>Driver Leaderboard</h4>
              <table className="grid-table">
                <thead><tr><th>Driver</th><th>Completed Rides</th></tr></thead>
                <tbody>
                  {semesterData.driverLeaderboard.map(d => (
                    <tr key={d.name}><td>{d.name}</td><td>{d.completed}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* Excel Export */}
      <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '24px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Export Report</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <select
            id="report-type-select"
            className="ro-input ro-input--sm"
            value={reportType}
            onChange={e => setReportType(e.target.value)}
            style={{ width: '200px' }}
          >
            {Object.entries(REPORT_SHEETS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <button
            id="download-excel-btn"
            className="ro-btn ro-btn--primary ro-btn--sm"
            disabled={downloading}
            onClick={handleDownload}
          >
            {downloading ? (
              <><i className="ti ti-loader-2 ti-spin"></i> Generating...</>
            ) : (
              <><i className="ti ti-download"></i> Download .xlsx</>
            )}
          </button>
        </div>

        {/* Report Preview */}
        <div id="report-preview-table">
          {/* Data summary bar */}
          {summaryData && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', padding: '12px 16px', background: 'var(--color-surface-dim)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
              {[
                { icon: 'ti-receipt', label: 'Rides', value: summaryData.totalRides },
                { icon: 'ti-circle-check', label: 'Completed', value: summaryData.completedRides },
                { icon: 'ti-steering-wheel', label: 'Drivers', value: summaryData.uniqueDrivers },
                { icon: 'ti-users', label: 'Riders', value: summaryData.uniqueRiders },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <i className={`ti ${item.icon}`} style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}></i>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.value}</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
            <i className="ti ti-info-circle" style={{ marginRight: '4px', opacity: 0.6 }}></i>
            {info.desc}
            {dateLabel && <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}> ({dateLabel})</span>}
          </div>

          {/* Sheets list */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Included Sheets ({info.sheets.length})
          </div>
          <div style={{ border: '1px solid var(--color-border-light)', borderRadius: 'var(--radius-sm)', padding: '4px 12px' }}>
            {info.sheets.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <i className={`ti ${s.icon}`} style={{ fontSize: '16px', color: 'var(--color-primary)', opacity: 0.7, width: '20px', textAlign: 'center' }}></i>
                <span style={{ fontWeight: 600, fontSize: '13px', minWidth: '130px' }}>{s.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
