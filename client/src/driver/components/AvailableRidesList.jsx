import { useToast } from '../../contexts/ToastContext';
import { claimRide } from '../../api';
import EmptyState from '../../components/ui/EmptyState';
import { formatTime } from '../../utils/formatters';

function getUrgencyBadge(ride) {
  if (!ride.requestedTime || ['completed', 'no_show'].includes(ride.status)) return null;
  const diffMs = new Date(ride.requestedTime).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin >= 0 && diffMin <= 15) {
    return (
      <span style={{ color: 'var(--status-no-show)', fontWeight: 700, fontSize: 11 }}>
        <i className="ti ti-clock" style={{ fontSize: 13, verticalAlign: 'middle' }} /> In {diffMin} min
      </span>
    );
  }
  if (diffMin > 15 && diffMin <= 30) {
    return (
      <span style={{ color: 'var(--status-on-the-way)', fontWeight: 700, fontSize: 11 }}>
        <i className="ti ti-clock" style={{ fontSize: 13, verticalAlign: 'middle' }} /> In {diffMin} min
      </span>
    );
  }
  return null;
}

export default function AvailableRidesList({ rides, onRefresh }) {
  const { showToast } = useToast();

  const handleClaim = async (id) => {
    try {
      await claimRide(id);
      showToast('Ride claimed successfully', 'success');
    } catch (e) {
      showToast(e.message || 'Failed to claim ride', 'error');
    }
    onRefresh();
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="fw-700" style={{ fontSize: 15 }}>Available Rides</span>
        <span className="text-xs text-muted">{rides.length} ride{rides.length === 1 ? '' : 's'}</span>
      </div>
      {rides.length === 0 ? (
        <EmptyState
          icon="ti-inbox"
          title="No rides available"
          message="Approved rides with no assigned driver will show up here."
        />
      ) : (
        <div className="strip-list">
          {rides.map(ride => (
            <div key={ride.id} className="strip-row" style={{ flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <span className="fw-700 text-sm">{formatTime(ride.requestedTime)}</span>
                {getUrgencyBadge(ride)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="fw-600 text-sm" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ride.pickupLocation} → {ride.dropoffLocation}
                </div>
                <div className="text-xs text-muted">{ride.riderName}</div>
              </div>
              <button className="ro-btn ro-btn--primary ro-btn--sm" onClick={() => handleClaim(ride.id)}>CLAIM</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
