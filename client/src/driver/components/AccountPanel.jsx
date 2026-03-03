import ProfileForm from '../../components/drawers/ProfileForm';
import PasswordChange from '../../components/drawers/PasswordChange';

export default function AccountPanel() {
  return (
    <>
      <ProfileForm idPrefix="profile-" placeholderWho="riders" />
      <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20 }}>
        <PasswordChange />
      </div>
    </>
  );
}
