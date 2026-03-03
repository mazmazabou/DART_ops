import { createPortal } from 'react-dom';

export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null;

  return createPortal(
    <>
      <div className="ro-drawer-overlay open" onClick={onClose} />
      <div className="ro-drawer open">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700 }}>{title || 'Details'}</span>
          <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={onClose}>{'\u2715'}</button>
        </div>
        <div>{children}</div>
      </div>
    </>,
    document.body
  );
}
