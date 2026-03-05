import { useState, useEffect } from 'react';
import { fetchAdminUserProfile, resetMissCount } from '../../../api';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import Drawer from '../../../components/ui/Drawer';

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x';

function defaultAvatarUrl(name) {
  return `${DICEBEAR_BASE}/initials/svg?seed=${encodeURIComponent(name || 'User')}`;
}

export default function UserDrawer({ userId, onClose, onResetPassword, onDeleteUser, onRestoreUser }) {
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) { setProfile(null); return; }
    setLoading(true);
    fetchAdminUserProfile(userId)
      .then(data => setProfile(data))
      .catch(e => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [userId, showToast]);

  const handleResetMissCount = async () => {
    try {
      await resetMissCount(userId);
      showToast('Miss count reset to 0.', 'success');
      const data = await fetchAdminUserProfile(userId);
      setProfile(data);
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const isSelf = currentUser?.id === userId;
  const user = profile?.user || profile;
  const missCount = profile?.missCount ?? 0;
  const maxStrikes = profile?.maxStrikes ?? 5;
  const rides = profile?.rides || [];

  return (
    <Drawer open={!!userId} onClose={onClose} title="User Details">
      {loading && (
        <div className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
      )}
      {!loading && user && (
        <div>
          {/* User header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div className="profile-avatar">
              <img src={user.avatar_url || defaultAvatarUrl(user.name)} alt={user.name} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>{user.name}</div>
              <span className={`status-badge status-badge--${user.role === 'office' ? 'approved' : user.role === 'driver' ? 'scheduled' : 'pending'}`}>
                {user.role}
              </span>
            </div>
          </div>

          {/* Deleted banner */}
          {user.deleted_at && (
            <div style={{
              padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px',
              background: 'rgba(107,114,128,0.1)',
              border: '1px solid var(--color-text-muted)',
              fontSize: '13px',
            }}>
              <strong>Deleted</strong> on {new Date(user.deleted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          )}

          {/* No-show banner for riders */}
          {user.role === 'rider' && missCount > 0 && (
            <div style={{
              padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '16px',
              background: missCount >= maxStrikes ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
              border: `1px solid ${missCount >= maxStrikes ? 'var(--status-denied)' : 'var(--status-on-the-way)'}`,
              fontSize: '13px',
            }}>
              <strong>{missCount >= maxStrikes ? 'Service Terminated' : 'No-Show Warning'}</strong>: {missCount} / {maxStrikes} consecutive no-shows.
              <button
                className="ro-btn ro-btn--outline ro-btn--sm"
                style={{ marginLeft: '8px' }}
                onClick={handleResetMissCount}
              >
                Reset Count
              </button>
            </div>
          )}

          {/* Details */}
          <div style={{
            fontSize: '13px',
            display: 'grid',
            gridTemplateColumns: '100px 1fr',
            gap: '8px',
            marginBottom: '24px',
          }}>
            <span className="text-muted">Email</span><span>{user.email || '\u2014'}</span>
            <span className="text-muted">Username</span><span>{user.username}</span>
            <span className="text-muted">Phone</span><span>{user.phone || '\u2014'}</span>
            <span className="text-muted">Member ID</span><span>{user.member_id || '\u2014'}</span>
          </div>

          {/* Recent rides */}
          {rides.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Recent Rides ({rides.length})
              </h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {rides.slice(0, 10).map(r => (
                  <div key={r.id} style={{
                    padding: '8px',
                    borderBottom: '1px solid var(--color-border)',
                    fontSize: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}>
                    <span>{r.pickup_location} \u2192 {r.dropoff_location}</span>
                    <span className={`status-badge status-badge--${r.status}`} style={{ fontSize: '11px' }}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isSelf && (
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
              {user.deleted_at ? (
                <button
                  className="ro-btn ro-btn--outline ro-btn--sm"
                  onClick={() => onRestoreUser(userId, user.name)}
                >
                  <i className="ti ti-refresh"></i> Restore User
                </button>
              ) : (
                <>
                  <button
                    className="ro-btn ro-btn--outline ro-btn--sm"
                    style={{ marginRight: '8px' }}
                    onClick={() => onResetPassword(userId, user.name)}
                  >
                    <i className="ti ti-key"></i> Reset Password
                  </button>
                  <button
                    className="ro-btn ro-btn--danger ro-btn--sm"
                    onClick={() => onDeleteUser(userId, user.name)}
                  >
                    <i className="ti ti-trash"></i> Delete User
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
