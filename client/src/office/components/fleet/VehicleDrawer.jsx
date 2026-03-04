import { useState, useEffect } from 'react';
import Drawer from '../../../components/ui/Drawer';
import { fetchMaintenanceLogs } from '../../../api';

export default function VehicleDrawer({ vehicle, onClose, onLogMaintenance, onRetire, onDelete, onReactivate }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vehicle) return;
    setLoading(true);
    fetchMaintenanceLogs(vehicle.id)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [vehicle]);

  if (!vehicle) return null;

  const lastMaint = vehicle.last_maintenance_date
    ? new Date(vehicle.last_maintenance_date).toLocaleDateString() : 'Never';
  const lastUsed = vehicle.lastUsed
    ? new Date(vehicle.lastUsed).toLocaleDateString() : 'Never';
  const statusColor = vehicle.status === 'retired' ? 'var(--color-text-muted)' : 'var(--status-completed)';

  let actionButtons;
  if (vehicle.status === 'retired') {
    actionButtons = (
      <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={() => { onClose(); onReactivate(vehicle); }}>
        Reactivate
      </button>
    );
  } else if (vehicle.rideCount > 0) {
    actionButtons = (
      <>
        <button className="ro-btn ro-btn--primary ro-btn--sm" onClick={() => { onClose(); onLogMaintenance(vehicle); }}>
          Log Maintenance
        </button>
        <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={() => { onClose(); onRetire(vehicle); }}>
          Retire
        </button>
      </>
    );
  } else {
    actionButtons = (
      <>
        <button className="ro-btn ro-btn--primary ro-btn--sm" onClick={() => { onClose(); onLogMaintenance(vehicle); }}>
          Log Maintenance
        </button>
        <button className="ro-btn ro-btn--danger ro-btn--sm" onClick={() => { onClose(); onDelete(vehicle); }}>
          Delete
        </button>
      </>
    );
  }

  return (
    <Drawer open={true} onClose={onClose} title={vehicle.name || 'Vehicle Details'}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: statusColor }} />
          <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{vehicle.status}</span>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{vehicle.type}</span>
        </div>
        {vehicle.maintenanceOverdue && (
          <div className="maintenance-alert" style={{ marginBottom: 12 }}>
            Maintenance overdue ({vehicle.daysSinceMaintenance} days since last service)
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Completed rides</span>
            <div style={{ fontWeight: 600 }}>{vehicle.rideCount}</div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Last used</span>
            <div style={{ fontWeight: 600 }}>{lastUsed}</div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Total miles</span>
            <div style={{ fontWeight: 600 }}>{vehicle.total_miles != null ? Number(vehicle.total_miles).toLocaleString() : 'N/A'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--color-text-muted)' }}>Last maintenance</span>
            <div style={{ fontWeight: 600 }}>{lastMaint}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {actionButtons}
      </div>

      <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: 12 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-text-secondary)' }}>
          <i className="ti ti-tool" style={{ marginRight: 4 }} />Maintenance History
        </h4>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
            No maintenance history yet.
          </div>
        ) : (
          <ul className="maint-timeline">
            {logs.map(log => {
              const date = new Date(log.service_date).toLocaleDateString();
              const mileage = log.mileage_at_service != null ? Number(log.mileage_at_service).toLocaleString() + ' mi' : '';
              const by = log.performed_by_name ? 'by ' + log.performed_by_name : '';
              const metaParts = [mileage, by].filter(Boolean).join(' \u00b7 ');
              return (
                <li key={log.id} className="maint-timeline__item">
                  <div className="maint-timeline__date">{date}</div>
                  {log.notes && <div className="maint-timeline__notes">{log.notes}</div>}
                  {metaParts && <div className="maint-timeline__meta">{metaParts}</div>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
