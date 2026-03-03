import { escapeHtml } from '../../utils/formatters';

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x';

export function defaultAvatarUrl(name) {
  return DICEBEAR_BASE + '/initials/svg?seed=' + encodeURIComponent(name || 'User');
}

export function ProfileAvatar({ avatarUrl, name, size }) {
  const sizeClass = size === 'lg' ? ' profile-avatar--lg' : '';
  const src = avatarUrl || defaultAvatarUrl(name);
  return (
    <div className={`profile-avatar${sizeClass}`}>
      <img src={src} alt={name || ''} />
    </div>
  );
}

export default function ProfileCard({ user, variant }) {
  const variantClass = variant ? ` profile-card--${variant}` : '';
  const displayName = user.preferredName || user.preferred_name || user.name || 'Unknown';
  const avatarSize = variant === 'hero' ? 'lg' : '';

  const details = [];
  if (user.major) details.push(user.major);
  const gradYear = user.graduationYear || user.graduation_year;
  if (gradYear) details.push("'" + String(gradYear).slice(-2));

  return (
    <div className={`profile-card${variantClass}`}>
      <ProfileAvatar avatarUrl={user.avatarUrl || user.avatar_url} name={user.name} size={avatarSize} />
      <div className="profile-info">
        <div className="profile-name">{displayName}</div>
        {details.length > 0 && (
          <div className="profile-detail">{details.join(' \u00B7 ')}</div>
        )}
        {user.bio && (
          <div className="profile-bio">{'\u201C'}{user.bio}{'\u201D'}</div>
        )}
      </div>
    </div>
  );
}
