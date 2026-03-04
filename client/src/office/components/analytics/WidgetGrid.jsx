import { useEffect, useRef, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { WIDGET_REGISTRY, getLogicalSize } from './constants';

function buildWidgetHeader(def) {
  const headerEl = document.createElement('div');
  headerEl.className = 'widget-card__header';

  const dragHandle = document.createElement('div');
  dragHandle.className = 'widget-card__drag-handle';
  const gripIcon = document.createElement('i');
  gripIcon.className = 'ti ti-grip-vertical';
  dragHandle.appendChild(gripIcon);

  const titleEl = document.createElement('h4');
  titleEl.className = 'widget-card__title';
  const titleIcon = document.createElement('i');
  titleIcon.className = 'ti ' + def.icon;
  titleEl.appendChild(titleIcon);
  titleEl.appendChild(document.createTextNode(' ' + def.title));

  const actionsEl = document.createElement('div');
  actionsEl.className = 'widget-card__actions';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'widget-action widget-action--remove';
  removeBtn.title = 'Remove';
  const removeIcon = document.createElement('i');
  removeIcon.className = 'ti ti-x';
  removeBtn.appendChild(removeIcon);
  actionsEl.appendChild(removeBtn);

  headerEl.appendChild(dragHandle);
  headerEl.appendChild(titleEl);
  headerEl.appendChild(actionsEl);
  return headerEl;
}

export default function WidgetGrid({ gridId, layout, editMode, onLayoutChange, onRemoveWidget, widgetRenderer }) {
  const gridElRef = useRef(null);
  const gridInstanceRef = useRef(null);
  const [portalTargets, setPortalTargets] = useState({});

  const saveCurrentLayout = useCallback(() => {
    const grid = gridInstanceRef.current;
    if (!grid) return;
    const items = grid.save(false);
    if (Array.isArray(items)) {
      const mapped = items.map(item => ({ id: item.id, x: item.x, y: item.y, w: item.w, h: item.h }));
      onLayoutChange(mapped);
    }
  }, [onLayoutChange]);

  // Build grid when layout changes
  useEffect(() => {
    const gridEl = gridElRef.current;
    if (!gridEl) return;
    const GridStack = window.GridStack;
    if (!GridStack) return;

    // Destroy existing
    if (gridInstanceRef.current) {
      try { gridInstanceRef.current.destroy(false); } catch (e) { /* ignore */ }
      gridInstanceRef.current = null;
    }

    gridEl.textContent = '';

    if (!layout || layout.length === 0) {
      setPortalTargets({});
      return;
    }

    // Build DOM elements
    const newTargets = {};
    layout.forEach(w => {
      const def = WIDGET_REGISTRY[w.id];
      if (!def) return;

      const itemEl = document.createElement('div');
      itemEl.className = 'grid-stack-item';
      itemEl.setAttribute('gs-id', w.id);
      itemEl.setAttribute('gs-x', w.x);
      itemEl.setAttribute('gs-y', w.y);
      itemEl.setAttribute('gs-w', w.w);
      itemEl.setAttribute('gs-h', w.h);
      if (def.minW) itemEl.setAttribute('gs-min-w', def.minW);
      if (def.maxW) itemEl.setAttribute('gs-max-w', def.maxW);
      if (def.minH) itemEl.setAttribute('gs-min-h', def.minH);
      if (def.maxH) itemEl.setAttribute('gs-max-h', def.maxH);
      if (def.noResize) {
        itemEl.setAttribute('gs-no-resize', 'true');
        itemEl.setAttribute('gs-no-move', 'true');
      }
      itemEl.setAttribute('data-logical-size', getLogicalSize(w.w));

      const contentEl = document.createElement('div');
      contentEl.className = 'grid-stack-item-content';

      contentEl.appendChild(buildWidgetHeader(def));

      // Body — React will portal into this
      const bodyEl = document.createElement('div');
      bodyEl.className = 'widget-card__body' + (def.containerClass ? ' ' + def.containerClass : '');
      bodyEl.id = 'widget-body-' + w.id;

      contentEl.appendChild(bodyEl);
      itemEl.appendChild(contentEl);
      gridEl.appendChild(itemEl);

      newTargets[w.id] = bodyEl;
    });

    // Init GridStack
    const grid = GridStack.init({
      column: 12,
      cellHeight: 80,
      margin: 8,
      animate: true,
      float: false,
      staticGrid: !editMode,
      disableResize: !editMode,
      draggable: { handle: '.widget-card__drag-handle' },
      columnOpts: {
        breakpoints: [
          { c: 12, w: 1200 },
          { c: 8, w: 996 },
          { c: 4, w: 768 },
          { c: 1, w: 480 },
        ],
        layout: 'list',
      },
    }, gridEl);

    gridInstanceRef.current = grid;

    // Bind remove buttons
    gridEl.querySelectorAll('.widget-action--remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const gsItem = btn.closest('.grid-stack-item');
        if (gsItem && gsItem.gridstackNode) {
          onRemoveWidget(gsItem.gridstackNode.id);
        }
      });
    });

    // Hook events
    grid.on('resizestop', (event, el) => {
      if (!el || !el.gridstackNode) return;
      const newLogical = getLogicalSize(el.gridstackNode.w);
      el.setAttribute('data-logical-size', newLogical);
      saveCurrentLayout();
    });

    grid.on('change', () => {
      gridEl.querySelectorAll('.grid-stack-item').forEach(el => {
        if (el.gridstackNode) {
          el.setAttribute('data-logical-size', getLogicalSize(el.gridstackNode.w));
        }
      });
      saveCurrentLayout();
    });

    setPortalTargets(newTargets);

    return () => {
      if (gridInstanceRef.current) {
        try { gridInstanceRef.current.destroy(false); } catch (e) { /* ignore */ }
        gridInstanceRef.current = null;
      }
    };
  }, [layout]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle static mode when editMode changes
  useEffect(() => {
    const grid = gridInstanceRef.current;
    if (!grid) return;
    grid.setStatic(!editMode);
    const gridEl = gridElRef.current;
    if (gridEl) gridEl.classList.toggle('gs-editing', editMode);
  }, [editMode]);

  return (
    <>
      <div ref={gridElRef} id={gridId} className="grid-stack">
        {(!layout || layout.length === 0) && (
          <div className="ro-empty" style={{ padding: '64px 24px', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <i className="ti ti-layout-dashboard"></i>
            <div className="ro-empty__title">No widgets on this tab</div>
            <div className="ro-empty__message">Click &quot;Customize&quot; to add widgets.</div>
          </div>
        )}
      </div>
      {Object.entries(portalTargets).map(([widgetId, targetEl]) =>
        targetEl && createPortal(
          widgetRenderer(widgetId),
          targetEl
        )
      )}
    </>
  );
}
