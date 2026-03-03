import { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { patchRideVehicle } from '../../api';

export default function VehicleSelector({ rideId, vehicleId, vehicles, onRefresh }) {
  const { showToast } = useToast();
  const [showSelect, setShowSelect] = useState(!vehicleId);
  const available = vehicles.filter(v => v.status !== 'retired');
  const currentVehicle = vehicles.find(v => v.id === vehicleId);

  const handleChange = async (newVehicleId) => {
    if (!newVehicleId) return;
    try {
      await patchRideVehicle(rideId, newVehicleId);
      showToast('Vehicle recorded', 'success');
      setShowSelect(false);
      onRefresh();
    } catch (e) {
      showToast(e.message || 'Failed to record vehicle', 'error');
    }
  };

  if (vehicleId && !showSelect) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, marginBottom: 8 }}>
        <i className="ti ti-car" style={{ color: 'var(--color-primary)' }} />
        <span>{currentVehicle?.name || 'Vehicle'}</span>
        <button
          onClick={() => setShowSelect(true)}
          style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div id="ride-vehicle-row" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        <i className="ti ti-car" /> Vehicle
      </div>
      <select
        id="ride-vehicle-select"
        onChange={e => handleChange(e.target.value)}
        defaultValue=""
        style={{
          width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
          borderRadius: 8, fontSize: 14, background: 'var(--color-surface)',
          color: 'var(--color-text)', appearance: 'none',
        }}
      >
        <option value="">Select vehicle…</option>
        {available.map(v => (
          <option key={v.id} value={v.id}>
            {v.name}{v.type === 'accessible' ? ' (Accessible)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
