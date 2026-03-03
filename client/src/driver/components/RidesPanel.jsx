import ActiveRideCard from './ActiveRideCard';
import EmptyState from '../../components/ui/EmptyState';
import { formatTime } from '../../utils/formatters';

export default function RidesPanel({ heroRide, upcoming, completed, vehicles, gracePeriodMinutes, onRefresh }) {
  if (!heroRide && upcoming.length === 0 && completed.length === 0) {
    return (
      <EmptyState
        icon="ti-road"
        title="No rides today"
        message="Your assigned rides will appear here."
      />
    );
  }

  return (
    <>
      {heroRide && (
        <ActiveRideCard ride={heroRide} vehicles={vehicles} gracePeriodMinutes={gracePeriodMinutes} onRefresh={onRefresh} />
      )}
      {upcoming.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="fw-700 text-sm" style={{ marginBottom: 8 }}>Upcoming</div>
          <div className="strip-list">
            {upcoming.map(ride => (
              <div key={ride.id} className="strip-row">
                <span className="fw-700 text-sm">{formatTime(ride.requestedTime)}</span>
                <span className="text-sm" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ride.riderName} — {ride.pickupLocation} → {ride.dropoffLocation}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {completed.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="fw-700 text-sm" style={{ marginBottom: 8 }}>Completed</div>
          {completed.map(ride => {
            const isCompleted = ride.status === 'completed';
            const icon = isCompleted ? 'ti-circle-check' : 'ti-alert-circle';
            const color = isCompleted ? 'var(--status-completed)' : 'var(--status-no-show)';
            const label = isCompleted ? 'Completed' : 'No-Show';
            return (
              <div key={ride.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', fontSize: 13 }}>
                <i className={`ti ${icon}`} style={{ fontSize: 16, color }} />
                <span className="fw-600">{formatTime(ride.requestedTime)}</span>
                <span className="text-muted" style={{ flex: 1 }}>{ride.riderName}</span>
                <span className="text-xs" style={{ color }}>{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
