import { useState, useEffect } from 'react';
import { fetchRecurringRides, cancelRecurringSeries } from '../../api';
import { useModal } from '../ui/Modal';
import { useToast } from '../../contexts/ToastContext';
import { formatTimeAmPm, formatDaysOfWeek, formatDateReadable } from '../../utils/formatters';

export default function RecurringSection() {
  const [recurring, setRecurring] = useState([]);
  const { showModal } = useModal();
  const { showToast } = useToast();

  const loadRecurring = () => {
    fetchRecurringRides()
      .then(setRecurring)
      .catch(() => setRecurring([]));
  };

  useEffect(() => {
    loadRecurring();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = await showModal({
      title: 'Cancel Recurring Series',
      body: 'Cancel this series and all future rides?',
      confirmLabel: 'Cancel Series',
      confirmClass: 'ro-btn--danger',
    });
    if (!confirmed) return;
    try {
      await cancelRecurringSeries(id);
      showToast('Series cancelled', 'success');
      loadRecurring();
    } catch {
      showToast('Could not cancel', 'error');
    }
  };

  if (recurring.length === 0) return null;

  return (
    <div className="recurring-section" id="recurring-section">
      <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>
        <i className="ti ti-repeat" style={{ marginRight: 4 }} /> Recurring Rides
      </h4>
      <div id="recurring-content">
        {recurring.map(r => (
          <div key={r.id} className="recurring-item">
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              {r.pickup_location} <i className="ti ti-arrow-right" style={{ fontSize: 11 }} /> {r.dropoff_location}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: 2 }}>
              {formatTimeAmPm(r.time_of_day)} &middot; {formatDaysOfWeek(r.days_of_week)}
            </div>
            <div className="text-xs text-muted">
              {formatDateReadable(r.start_date)} {'\u2013'} {formatDateReadable(r.end_date)}
            </div>
            <div className="text-xs text-muted">
              {r.status.charAt(0).toUpperCase() + r.status.slice(1)} &middot; {r.upcomingCount || 0} upcoming
            </div>
            {r.status === 'active' && (
              <button className="ro-btn ro-btn--outline ro-btn--sm" style={{ marginTop: 6 }} onClick={() => handleCancel(r.id)}>
                Cancel Series
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
