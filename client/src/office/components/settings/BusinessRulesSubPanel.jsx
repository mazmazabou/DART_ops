import { useState, useEffect, useCallback } from 'react';
import { fetchSettings, saveSettings } from '../../../api';
import { useToast } from '../../../contexts/ToastContext';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BusinessRulesSubPanel() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({});
  const [operatingDays, setOperatingDays] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await fetchSettings();
      const flat = {};
      Object.values(data).flat().forEach(s => { flat[s.key] = s.value; });
      setSettings(flat);
      // Parse operating days
      const days = (flat.operating_days || '0,1,2,3,4').split(',').map(Number).filter(n => !isNaN(n));
      setOperatingDays(new Set(days));
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleDay = (dayIndex) => {
    setOperatingDays(prev => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex); else next.add(dayIndex);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const arr = [
        { key: 'service_hours_start', value: settings.service_hours_start || '08:00' },
        { key: 'service_hours_end', value: settings.service_hours_end || '19:00' },
        { key: 'operating_days', value: Array.from(operatingDays).sort().join(',') },
        { key: 'auto_deny_outside_hours', value: String(settings.auto_deny_outside_hours ?? 'true') },
        { key: 'grace_period_minutes', value: String(settings.grace_period_minutes ?? '5') },
        { key: 'max_no_show_strikes', value: String(settings.max_no_show_strikes ?? '5') },
        { key: 'strikes_enabled', value: String(settings.strikes_enabled ?? 'true') },
        { key: 'tardy_threshold_minutes', value: String(settings.tardy_threshold_minutes ?? '1') },
      ];
      await saveSettings(arr);
      showToast('Settings saved.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-24 text-muted">Loading settings...</div>;

  return (
    <div id="business-rules-container" className="p-24">
      {/* Operations */}
      <h3 className="ro-section__title">Operations</h3>
      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div className="flex items-center gap-8" style={{ flexWrap: 'wrap' }}>
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Service Hours</label>
          <input
            type="time"
            className="ro-input"
            style={{ width: 'auto' }}
            value={settings.service_hours_start || '08:00'}
            onChange={e => updateSetting('service_hours_start', e.target.value)}
          />
          <span className="text-muted">to</span>
          <input
            type="time"
            className="ro-input"
            style={{ width: 'auto' }}
            value={settings.service_hours_end || '19:00'}
            onChange={e => updateSetting('service_hours_end', e.target.value)}
          />
        </div>
        <div>
          <label className="ro-label" style={{ marginBottom: '8px' }}>Operating Days</label>
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                className={`ro-btn ro-btn--sm ${operatingDays.has(i) ? 'ro-btn--primary' : 'ro-btn--outline'}`}
                style={{ minWidth: '48px' }}
                onClick={() => toggleDay(i)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-8">
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Auto-Deny Outside Hours</label>
          <input
            type="checkbox"
            checked={settings.auto_deny_outside_hours !== 'false'}
            onChange={e => updateSetting('auto_deny_outside_hours', String(e.target.checked))}
          />
        </div>
        <div className="flex items-center gap-8">
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Grace Period (min)</label>
          <input
            type="number"
            className="ro-input"
            style={{ width: '80px' }}
            min="0"
            value={settings.grace_period_minutes ?? '5'}
            onChange={e => updateSetting('grace_period_minutes', e.target.value)}
          />
        </div>
      </div>

      {/* Rides */}
      <h3 className="ro-section__title">Rides</h3>
      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div className="flex items-center gap-8">
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Max No-Show Strikes</label>
          <input
            type="number"
            className="ro-input"
            style={{ width: '80px' }}
            min="1"
            value={settings.max_no_show_strikes ?? '5'}
            onChange={e => updateSetting('max_no_show_strikes', e.target.value)}
          />
        </div>
        <div className="flex items-center gap-8">
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Strikes Enabled</label>
          <input
            type="checkbox"
            checked={settings.strikes_enabled !== 'false'}
            onChange={e => updateSetting('strikes_enabled', String(e.target.checked))}
          />
        </div>
      </div>

      {/* Staff */}
      <h3 className="ro-section__title">Staff</h3>
      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
        <div className="flex items-center gap-8">
          <label className="ro-label" style={{ marginBottom: 0, minWidth: '140px' }}>Tardy Threshold (min)</label>
          <input
            type="number"
            className="ro-input"
            style={{ width: '80px' }}
            min="1"
            value={settings.tardy_threshold_minutes ?? '1'}
            onChange={e => updateSetting('tardy_threshold_minutes', e.target.value)}
          />
        </div>
      </div>

      <button className="ro-btn ro-btn--primary" onClick={handleSave} disabled={saving}>
        <i className="ti ti-device-floppy"></i> {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
