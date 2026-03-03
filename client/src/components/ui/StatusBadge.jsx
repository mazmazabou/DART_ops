import { statusLabel } from '../../utils/status';

export default function StatusBadge({ status }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      {statusLabel(status)}
    </span>
  );
}
