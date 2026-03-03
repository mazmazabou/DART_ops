import { useAuth } from '../../../contexts/AuthContext';
import ProfileForm from '../../../components/drawers/ProfileForm';
import PasswordChange from '../../../components/drawers/PasswordChange';

export default function ProfilePanel() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="ro-section">
      <div id="admin-profile-content" style={{ maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h2 className="ro-section__title" style={{ margin: '0 0 4px' }}>My Profile</h2>
          <div className="text-xs text-muted">Update your personal information and preferences.</div>
        </div>
        <ProfileForm idPrefix="admin-profile-" placeholderWho="staff" />
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Change Password</h3>
          <PasswordChange />
        </div>
      </div>
    </div>
  );
}
