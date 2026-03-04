import React from 'react';
import { resolveColor } from '../constants';

const COHORT_CARDS = [
  { key: 'active', label: 'Active', icon: 'ti ti-user-check', cssVar: 'var(--status-completed)' },
  { key: 'new', label: 'New', icon: 'ti ti-user-plus', cssVar: 'var(--status-approved)' },
  { key: 'returning', label: 'Returning', icon: 'ti ti-refresh', cssVar: 'var(--color-primary)' },
  { key: 'atRisk', label: 'At Risk', icon: 'ti ti-alert-triangle', cssVar: 'var(--status-on-the-way)' },
  { key: 'churned', label: 'Churned', icon: 'ti ti-user-minus', cssVar: 'var(--color-text-muted)' },
  { key: 'terminated', label: 'Terminated', icon: 'ti ti-user-x', cssVar: 'var(--status-no-show)' },
];

export default function RiderCohortsWidget({ data }) {
  const summary = data?.summary || {};
  const retentionRate = data?.retentionRate;

  if (!data || !data.summary) {
    return (
      <div className="ro-empty" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
        <i className="ti ti-users-group" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }} />
        No rider cohort data available
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
        {COHORT_CARDS.map((card) => {
          const color = resolveColor(card.cssVar) || '#6b7280';
          const count = summary[card.key] || 0;

          return (
            <div
              key={card.key}
              style={{
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-border, #e5e7eb)',
                background: 'var(--color-card-bg, #fff)',
                textAlign: 'center',
              }}
            >
              <i
                className={card.icon}
                style={{ fontSize: '1.25rem', color, display: 'block', marginBottom: '0.25rem' }}
              />
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {count.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #6b7280)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {retentionRate != null && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border, #e5e7eb)', fontSize: '0.85rem', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>
          Retention Rate: <strong style={{ color: 'var(--color-text, #1f2937)', fontSize: '1rem' }}>{retentionRate.toFixed(1)}%</strong>
        </div>
      )}
    </div>
  );
}
