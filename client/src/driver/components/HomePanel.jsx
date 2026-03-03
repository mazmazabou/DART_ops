import ClockButton from './ClockButton';
import AvailableRidesList from './AvailableRidesList';

export default function HomePanel({ isActive, employee, rides, vehicles, userId, available, onRefresh }) {
  if (!isActive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <i className="ti ti-plug-off" style={{ fontSize: 48, color: 'var(--color-text-muted)', marginBottom: 16 }} />
        <div className="fw-700" style={{ fontSize: 18, marginBottom: 8 }}>You're Clocked Out</div>
        <ClockButton isActive={false} employee={employee} rides={rides} userId={userId} onRefresh={onRefresh} />
        <div className="text-sm text-muted">Clock in to see available rides</div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-completed)', display: 'inline-block' }} />
        <span className="fw-700" style={{ fontSize: 14 }}>You're Online</span>
      </div>
      <ClockButton isActive={true} employee={employee} rides={rides} userId={userId} onRefresh={onRefresh} />
      <AvailableRidesList rides={available} onRefresh={onRefresh} />
    </>
  );
}
