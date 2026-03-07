import { useState, useEffect, useCallback } from 'react';
import { usePolling } from '../../../hooks/usePolling';
import { fetchEmployees, fetchTodayDriverStatus, fetchOpsConfig } from '../../../api';
import EmployeeBar from './EmployeeBar';
import ShiftCalendar from './ShiftCalendar';

export default function StaffPanel({ isVisible }) {
  const [employees, setEmployees] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [opsConfig, setOpsConfig] = useState(null);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);

  // Defer FullCalendar mount until panel is visible (prevents garbled flash)
  useEffect(() => {
    if (isVisible && !hasBeenVisible) {
      requestAnimationFrame(() => setHasBeenVisible(true));
    }
  }, [isVisible, hasBeenVisible]);

  // Re-fetch opsConfig every time panel becomes visible (picks up settings changes)
  useEffect(() => {
    if (isVisible) {
      fetchOpsConfig().then(setOpsConfig).catch(() => {});
    }
  }, [isVisible]);

  // Poll employees + today status (5s)
  const pollData = useCallback(async () => {
    try {
      const [emps, status] = await Promise.all([
        fetchEmployees(),
        fetchTodayDriverStatus(),
      ]);
      setEmployees(emps);
      setTodayStatus(status);
    } catch {
      // silent — will retry
    }
  }, []);

  usePolling(pollData, 5000);

  const refresh = useCallback(async () => {
    try {
      const [emps, status] = await Promise.all([
        fetchEmployees(),
        fetchTodayDriverStatus(),
      ]);
      setEmployees(emps);
      setTodayStatus(status);
    } catch {
      // silent
    }
  }, []);

  return (
    <div>
      {/* Employee Bar */}
      <div className="ro-section">
        <div className="ro-section__header">
          <h3 className="ro-section__title">
            <i className="ti ti-users" /> Drivers
          </h3>
        </div>
        <EmployeeBar
          employees={employees}
          todayStatus={todayStatus}
          onRefresh={refresh}
        />
      </div>

      {/* Shift Calendar */}
      <div className="ro-section" style={{ marginTop: 20 }}>
        <div className="ro-section__header">
          <h3 className="ro-section__title">
            <i className="ti ti-calendar" /> Shift Schedule
          </h3>
        </div>
        {employees.length > 0 && hasBeenVisible ? (
          <ShiftCalendar
            employees={employees}
            opsConfig={opsConfig}
          />
        ) : (
          <div className="calendar-skeleton" style={{ height: 500, borderRadius: 8 }} />
        )}
      </div>
    </div>
  );
}
