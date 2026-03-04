export default function WidgetToolbar({ editMode, onToggleEdit, onAdd, onSetDefault, onReset }) {
  if (!editMode) {
    return (
      <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={onToggleEdit}>
        <i className="ti ti-adjustments"></i> Customize
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <button className="ro-btn ro-btn--primary ro-btn--sm" onClick={onToggleEdit}>
        <i className="ti ti-check"></i> Done
      </button>
      <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={onAdd}>
        <i className="ti ti-plus"></i> Add Widget
      </button>
      <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={onSetDefault}>
        <i className="ti ti-bookmark"></i> Set Default
      </button>
      <button className="ro-btn ro-btn--outline ro-btn--sm" onClick={onReset}>
        <i className="ti ti-arrow-back-up"></i> Reset
      </button>
    </div>
  );
}
