export default function EmptyState({ icon, title, message, children }) {
  return (
    <div className="ro-empty">
      {icon && <i className={`ti ${icon}`} />}
      {title && <div className="ro-empty__title">{title}</div>}
      {message && <div className="ro-empty__message">{message}</div>}
      {children}
    </div>
  );
}
