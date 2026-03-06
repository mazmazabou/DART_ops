import { useState, useEffect, useCallback } from 'react';
import { fetchNotifPreferences, saveNotifPreferences, fetchSettings, saveSettings } from '../../../api';
import { useToast } from '../../../contexts/ToastContext';

export default function NotifSettingsSubPanel() {
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const load = useCallback(async () => {
    try {
      const [prefsData, settingsData] = await Promise.all([
        fetchNotifPreferences(),
        fetchSettings(),
      ]);
      setPrefs(prefsData);
      const flat = {};
      Object.values(settingsData).flat().forEach(s => { flat[s.key] = s.value; });
      setSettings(flat);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  const toggleChannel = async (eventType, channel) => {
    const prev = prefs.preferences[eventType]?.channels?.[channel];
    if (!prev) return;
    const newEnabled = !prev.enabled;

    // Optimistic update
    setPrefs(p => {
      const next = JSON.parse(JSON.stringify(p));
      next.preferences[eventType].channels[channel].enabled = newEnabled;
      return next;
    });

    setSavingKey(`${eventType}-${channel}`);
    try {
      await saveNotifPreferences({
        preferences: [{
          eventType,
          channel,
          enabled: newEnabled,
          thresholdValue: prev.thresholdValue,
        }]
      });
      showToast('Preference saved', 'success');
    } catch (e) {
      // Revert on error
      setPrefs(p => {
        const next = JSON.parse(JSON.stringify(p));
        next.preferences[eventType].channels[channel].enabled = !newEnabled;
        return next;
      });
      showToast(e.message, 'error');
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div id="notif-prefs-container" className="p-24 text-muted">
        Loading notification preferences...
      </div>
    );
  }

  return (
    <div id="notif-prefs-container" className="p-24">
      <h3 className="ro-section__title">Notification Preferences</h3>
      <div className="text-xs text-muted mb-16">
        Configure which notifications are sent via email and in-app channels.
      </div>

      {prefs && (() => {
        const entries = Object.entries(prefs.preferences);
        return entries.map(([eventType, pref], idx) => (
          <div key={eventType} className="flex items-center justify-between gap-16" style={{
            padding: '12px 0',
            borderBottom: idx < entries.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div className="min-w-0">
              <div className="fw-600 text-13" style={{ marginBottom: '2px' }}>{pref.label}</div>
              <div className="text-xs text-muted">{pref.description}</div>
            </div>
            <div className="flex gap-16" style={{ flexShrink: 0 }}>
              {Object.entries(pref.channels).map(([channel, ch]) => (
                <label key={channel} className="notif-toggle-label">
                  <input
                    type="checkbox"
                    className="notif-toggle-input"
                    checked={ch.enabled}
                    onChange={() => toggleChannel(eventType, channel)}
                    disabled={savingKey === `${eventType}-${channel}`}
                  />
                  <span className="notif-toggle-switch" />
                  <span className="notif-toggle-text">
                    {channel === 'email' ? 'Email' : 'In-App'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ));
      })()}
    </div>
  );
}
