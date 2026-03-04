import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { WIDGET_REGISTRY, WIDGET_CATEGORIES } from './constants';

export default function WidgetLibraryDrawer({ open, onClose, visibleWidgetIds, allowedWidgets, onAddWidget }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);
  const visibleSet = new Set(visibleWidgetIds);
  const allowedSet = allowedWidgets ? new Set(allowedWidgets) : null;

  const available = Object.keys(WIDGET_REGISTRY).filter(id => {
    if (visibleSet.has(id)) return false;
    if (allowedSet && !allowedSet.has(id)) return false;
    return true;
  });

  // Separate KPI widgets from chart widgets
  const kpis = available.filter(id => WIDGET_REGISTRY[id].isKPI);
  const charts = available.filter(id => !WIDGET_REGISTRY[id].isKPI);

  // Group chart widgets by category
  const groups = {};
  charts.forEach(id => {
    const def = WIDGET_REGISTRY[id];
    const cat = def.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(id);
  });

  // Portal to document.body to avoid stacking context issues
  return createPortal(
    <>
      <div
        className={`widget-library-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
      />
      <div className={`widget-library-drawer${open ? ' open' : ''}`}>
        <div className="widget-library-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>Widget Library</h3>
          <button className="ro-btn ro-btn--ghost ro-btn--sm" onClick={onClose}>
            <i className="ti ti-x"></i>
          </button>
        </div>
        <div id="widget-library-list" style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
          {available.length === 0 ? (
            <div className="ro-empty">
              <i className="ti ti-check"></i>
              <div className="ro-empty__title">All widgets placed</div>
              <div className="ro-empty__message">Every available widget is on this tab.</div>
            </div>
          ) : (
            <>
              {kpis.length > 0 && (
                <div className="widget-library-group">
                  <div className="widget-library-group__label">KPIs</div>
                  {kpis.map(id => {
                    const def = WIDGET_REGISTRY[id];
                    return (
                      <div key={id} className="widget-library-item">
                        <div className="widget-library-item__icon">
                          <i className={`ti ${def.icon}`}></i>
                        </div>
                        <div className="widget-library-item__info">
                          <div className="widget-library-item__name">{def.title}</div>
                          <div className="widget-library-item__desc">{def.description || ''}</div>
                        </div>
                        <button
                          className="ro-btn ro-btn--outline ro-btn--xs widget-library-item__add"
                          title="Add to tab"
                          onClick={() => onAddWidget(id)}
                        >
                          <i className="ti ti-plus"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {Object.keys(groups).map(cat => (
                <div key={cat} className="widget-library-group">
                  <div className="widget-library-group__label">
                    {WIDGET_CATEGORIES[cat] || cat}
                  </div>
                  {groups[cat].map(id => {
                    const def = WIDGET_REGISTRY[id];
                    return (
                      <div key={id} className="widget-library-item">
                        <div className="widget-library-item__icon">
                          <i className={`ti ${def.icon}`}></i>
                        </div>
                        <div className="widget-library-item__info">
                          <div className="widget-library-item__name">{def.title}</div>
                          <div className="widget-library-item__desc">{def.description || ''}</div>
                        </div>
                        <button
                          className="ro-btn ro-btn--outline ro-btn--xs widget-library-item__add"
                          title="Add to tab"
                          onClick={() => onAddWidget(id)}
                        >
                          <i className="ti ti-plus"></i>
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
