import { useToast } from '../../contexts/ToastContext';

const DICEBEAR_BASE = 'https://api.dicebear.com/9.x';
const DICEBEAR_STYLES = [
  { id: 'thumbs', label: 'Thumbs' },
  { id: 'fun-emoji', label: 'Emoji' },
  { id: 'avataaars', label: 'People' },
  { id: 'bottts', label: 'Robots' },
  { id: 'shapes', label: 'Shapes' },
  { id: 'initials', label: 'Initials' },
];

function dicebearUrl(style, seed) {
  return DICEBEAR_BASE + '/' + style + '/svg?seed=' + encodeURIComponent(seed);
}

export default function AvatarPicker({ currentUrl, userId, onSelect }) {
  const { showToast } = useToast();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      showToast('Image must be under 500KB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => onSelect(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="avatar-picker" id="avatar-picker">
        {DICEBEAR_STYLES.map(style => {
          const url = dicebearUrl(style.id, userId || 'preview');
          return (
            <div
              key={style.id}
              className={`avatar-option${currentUrl === url ? ' selected' : ''}`}
              data-avatar-url={url}
              data-style={style.id}
              title={style.label}
              onClick={() => onSelect(url)}
            >
              <img src={url} alt={style.label} />
            </div>
          );
        })}
      </div>
      <label className="avatar-upload-btn" htmlFor="avatar-upload-input">
        <i className="ti ti-upload" /> Upload Photo Instead
      </label>
      <input
        type="file"
        id="avatar-upload-input"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
    </>
  );
}
