export default function TerminationBanner({ visible }) {
  if (!visible) return null;

  return (
    <div
      id="terminated-banner"
      style={{
        background: 'rgba(239,68,68,0.08)',
        color: 'var(--status-no-show)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-sm)',
        margin: '0 16px 12px',
        fontSize: 13,
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      <i className="ti ti-alert-circle" style={{ verticalAlign: 'middle', marginRight: 4 }} />
      Your ride privileges have been suspended due to repeated no-shows. Please contact the transportation office to reinstate your account.
    </div>
  );
}
