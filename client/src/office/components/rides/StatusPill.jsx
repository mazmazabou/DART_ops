export default function StatusPill({ status, label, active, onClick }) {
  return (
    <button
      className={`filter-pill${active ? ' active' : ''}`}
      data-ride-status={status}
      onClick={() => onClick(status)}
    >
      {label}
    </button>
  );
}
