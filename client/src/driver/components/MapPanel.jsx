import { useTenant } from '../../contexts/TenantContext';

export default function MapPanel({ activeRide, isVisible }) {
  const { tenantConfig } = useTenant();

  const campusMapUrl = tenantConfig?.mapUrl || null;
  const embeddable = campusMapUrl && tenantConfig?.mapEmbeddable !== false;

  if (!campusMapUrl) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16, color: 'var(--color-text-muted)', textAlign: 'center', padding: 24 }}>
        <i className="ti ti-map-off" style={{ fontSize: 48, opacity: 0.3 }} />
        <div style={{ fontSize: 15, fontWeight: 500 }}>No campus map configured</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16, height: 'calc(100vh - 128px)', boxSizing: 'border-box' }}>
      {activeRide && (
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 16, border: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Active Ride
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            {activeRide.riderName || 'Rider'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
              <i className="ti ti-circle-dot" style={{ color: 'var(--color-primary)', marginTop: 1, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-muted)' }}>From:</span>
              <span style={{ fontWeight: 500 }}>{activeRide.pickupLocation || 'Not specified'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
              <i className="ti ti-map-pin" style={{ color: 'var(--color-primary)', marginTop: 1, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-muted)' }}>To:</span>
              <span style={{ fontWeight: 500 }}>{activeRide.dropoffLocation || 'Not specified'}</span>
            </div>
          </div>
        </div>
      )}
      {embeddable ? (
        <>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)', flex: 1, minHeight: 200 }}>
            {isVisible && (
              <iframe
                src={campusMapUrl}
                width="100%"
                height="100%"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                title="Campus Map"
              />
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: -4, flexShrink: 0 }}>
            Campus map — use pinch/zoom to navigate
          </div>
        </>
      ) : (
        <a
          href={campusMapUrl}
          target="_blank"
          rel="noopener"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: 'var(--color-primary)', color: 'white', padding: 16, borderRadius: 12,
            textDecoration: 'none', fontWeight: 700, fontSize: 16, letterSpacing: 0.3,
            flexShrink: 0, boxShadow: '0 4px 12px rgba(var(--color-primary-rgb),0.35)',
          }}
        >
          <i className="ti ti-map-2" style={{ fontSize: 20 }} /> Open Campus Map
        </a>
      )}
    </div>
  );
}
