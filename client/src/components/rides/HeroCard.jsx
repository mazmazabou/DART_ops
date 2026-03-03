import StatusBadge from '../ui/StatusBadge';
import ProfileCard from '../ui/ProfileCard';
import GraceTimer from './GraceTimer';
import { formatDateTime, escapeHtml } from '../../utils/formatters';

export default function HeroCard({ ride, onCancel, opsConfig }) {
  const driverStatuses = ['scheduled', 'driver_on_the_way', 'driver_arrived_grace'];
  const showDriver = driverStatuses.includes(ride.status) && ride.assignedDriverId;
  const canCancel = ride.status === 'pending' || (ride.status === 'approved' && !ride.assignedDriverId);
  const graceMins = opsConfig ? Number(opsConfig.grace_period_minutes || 5) : 5;

  const driverProfile = showDriver ? {
    name: ride.driverName,
    preferredName: ride.driverPreferredName,
    avatarUrl: ride.driverAvatar,
    bio: ride.driverBio,
  } : null;

  return (
    <div className="ride-hero">
      <div className="ride-hero__status">
        <StatusBadge status={ride.status} />
      </div>
      <div className="ride-hero__route">
        {ride.pickupLocation} <i className="ti ti-arrow-right" style={{ fontSize: 14, verticalAlign: 'middle' }} /> {ride.dropoffLocation}
      </div>
      <div className="ride-hero__time">{formatDateTime(ride.requestedTime)}</div>

      {ride.status === 'pending' && (
        <div className="ride-hero__message">
          <span className="pulse-dot" /> Waiting for approval<span className="animated-dots" />
        </div>
      )}
      {ride.status === 'approved' && (
        <div className="ride-hero__message">
          <span className="pulse-dot approved" /> Approved! Waiting for a driver<span className="animated-dots" />
        </div>
      )}
      {ride.status === 'scheduled' && (
        <div className="ride-hero__message">
          <i className="ti ti-user-check" style={{ color: 'var(--status-scheduled)' }} /> Driver assigned
        </div>
      )}
      {ride.status === 'driver_on_the_way' && (
        <div className="ride-hero__message">
          <span className="pulse-dot on-the-way" /> Your driver is on the way<span className="animated-dots" />
        </div>
      )}
      {ride.status === 'driver_arrived_grace' && (
        <>
          <div className="ride-hero__message">
            <i className="ti ti-map-pin-check" style={{ color: 'var(--status-grace)', fontSize: 18 }} /> Your driver has arrived!
          </div>
          <GraceTimer graceStartTime={ride.graceStartTime} gracePeriodMinutes={graceMins} />
        </>
      )}

      {driverProfile && (
        <div style={{ marginTop: 16 }}>
          <ProfileCard user={driverProfile} variant="hero" />
        </div>
      )}
      {showDriver && ride.driverPhone && (
        <a
          href={`sms:${ride.driverPhone}`}
          className="ro-btn ro-btn--outline ro-btn--full"
          style={{ marginTop: 12, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
        >
          <i className="ti ti-message" /> Text Driver
        </a>
      )}

      {ride.notes && (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
          <i className="ti ti-note" style={{ marginRight: 4 }} /> {ride.notes}
        </div>
      )}

      {canCancel && (
        <button className="ro-btn ro-btn--outline ro-btn--full" style={{ marginTop: 16 }} onClick={() => onCancel(ride.id)}>
          Cancel Ride
        </button>
      )}
    </div>
  );
}
