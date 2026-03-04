import { useToast } from '../../../contexts/ToastContext';
import { clockIn, clockOut } from '../../../api';

export default function EmployeeBar({ employees, todayStatus, onRefresh }) {
  const { showToast } = useToast();

  async function handleClock(empId, isIn) {
    try {
      if (isIn) {
        await clockIn(empId);
      } else {
        await clockOut(empId);
      }
      showToast(isIn ? 'Clocked in' : 'Clocked out', 'success');
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Failed to update clock status', 'error');
    }
  }

  return (
    <div className="employee-bar">
      {employees.map(emp => {
        const statusData = todayStatus.find(d => d.id === emp.id);
        const hasClockedInToday = statusData?.todayClockEvents?.length > 0;
        let tardyMins = 0;

        if (!emp.active && !hasClockedInToday && statusData?.todayShifts?.length) {
          const now = new Date();
          const nowMins = now.getHours() * 60 + now.getMinutes();
          const activeShift = statusData.todayShifts.find(s => {
            const [sh, sm] = s.start_time.split(':').map(Number);
            const [eh, em] = s.end_time.split(':').map(Number);
            return nowMins >= (sh * 60 + sm) && nowMins < (eh * 60 + em);
          });
          if (activeShift) {
            const [sh, sm] = activeShift.start_time.split(':').map(Number);
            tardyMins = nowMins - (sh * 60 + sm);
          }
        }

        return (
          <div
            key={emp.id}
            className={'emp-chip' + (emp.active ? ' active' : '')}
            title={emp.name + ' \u2014 ' + (emp.active ? 'Clocked In' : 'Clocked Out')}
          >
            <span className={'emp-dot' + (emp.active ? ' active' : '')} />
            <span className="emp-name">{emp.name}</span>
            <span className={'emp-status-label ' + (emp.active ? 'clocked-in' : 'clocked-out')}>
              {emp.active ? 'Clocked In' : 'Clocked Out'}
            </span>
            {tardyMins > 0 && (
              <span className="tardy-badge">
                <i className="ti ti-clock-exclamation" />{tardyMins}m late
              </span>
            )}
            <button
              className={'emp-action-btn ' + (emp.active ? 'clock-out' : 'clock-in')}
              title={(emp.active ? 'Clock out ' : 'Clock in ') + emp.name}
              onClick={() => handleClock(emp.id, !emp.active)}
            >
              {emp.active ? 'Clock Out' : 'Clock In'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
