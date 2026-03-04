import { useState, useEffect, useCallback, useRef } from 'react';
import { usePolling } from '../../../hooks/usePolling';
import { fetchEmployees, fetchTodayDriverStatus, fetchOpsConfig } from '../../../api';
import EmployeeBar from './EmployeeBar';
import ShiftCalendar from './ShiftCalendar';

export default function StaffPanel() {
  const [employees, setEmployees] = useState([]);
  const [todayStatus, setTodayStatus] = useState([]);
  const [opsConfig, setOpsConfig] = useState(null);
  const loadedOnce = useRef(false);

  // Load opsConfig once
  useEffect(() => {
    if (loadedOnce.current) return;
    loadedOnce.current = true;
    fetchOpsConfig().then(setOpsConfig).catch(() => {});
  }, []);

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
        {employees.length > 0 ? (
          <ShiftCalendar
            employees={employees}
            opsConfig={opsConfig}
          />
        ) : (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 13 }}>
            Loading drivers...
          </div>
        )}
      </div>
    </div>
  );
}
