import { useEffect, useRef, useCallback } from 'react';
import { WIDGET_REGISTRY, getLogicalSize } from '../constants.js';

/**
 * Build the inner HTML for a grid-stack-item-content element.
 *
 * SAFETY NOTE: Widget card HTML is constructed entirely from developer-defined
 * registry data (title, icon) -- not user input. This mirrors the established
 * pattern in the vanilla widget-system.js (lines 132-148).
 */
function buildItemContent(widgetId) {
  const def = WIDGET_REGISTRY[widgetId];
  if (!def) return '';

  // Build via DOM APIs to avoid innerHTML on untrusted content.
  // Since this returns an HTML string consumed by a single innerHTML call
  // on a freshly created element, and all values come from the developer-
  // defined WIDGET_REGISTRY (never user input), this is safe.
  const header = document.createElement('div');
  header.className = 'widget-card__header';

  const dragHandle = document.createElement('div');
  dragHandle.className = 'widget-card__drag-handle';
  const gripIcon = document.createElement('i');
  gripIcon.className = 'ti ti-grip-vertical';
  dragHandle.appendChild(gripIcon);
  header.appendChild(dragHandle);

  const title = document.createElement('h4');
  title.className = 'widget-card__title';
  const titleIcon = document.createElement('i');
  titleIcon.className = 'ti ' + def.icon;
  title.appendChild(titleIcon);
  title.appendChild(document.createTextNode(' ' + def.title));
  header.appendChild(title);

  const actions = document.createElement('div');
  actions.className = 'widget-card__actions';
  const removeBtn = document.createElement('button');
  removeBtn.className = 'widget-action widget-action--remove';
  removeBtn.title = 'Remove';
  const removeIcon = document.createElement('i');
  removeIcon.className = 'ti ti-x';
  removeBtn.appendChild(removeIcon);
  actions.appendChild(removeBtn);
  header.appendChild(actions);

  const body = document.createElement('div');
  body.className = 'widget-card__body';
  body.id = 'widget-body-' + widgetId;

  const wrapper = document.createDocumentFragment();
  wrapper.appendChild(header);
  wrapper.appendChild(body);

  return wrapper;
}

/**
 * Build the empty-state placeholder DOM.
 */
function buildEmptyState() {
  const container = document.createElement('div');
  container.className = 'ro-empty';
  container.style.cssText = 'padding:64px 24px;border:2px dashed var(--color-border);border-radius:var(--radius-md);text-align:center;';

  const icon = document.createElement('i');
  icon.className = 'ti ti-layout-dashboard';
  container.appendChild(icon);

  const title = document.createElement('div');
  title.className = 'ro-empty__title';
  title.textContent = 'No widgets on this tab';
  container.appendChild(title);

  const message = document.createElement('div');
  message.className = 'ro-empty__message';
  message.textContent = 'Click "Customize" to add widgets.';
  container.appendChild(message);

  return container;
}

/**
 * useGridStack -- manages the GridStack lifecycle for one analytics tab grid.
 *
 * GridStack is loaded from CDN and accessed via `window.GridStack`.
 *
 * @param {React.RefObject} gridRef       - ref to the container <div>
 * @param {Array}           layout        - array of { id, x, y, w, h } items
 * @param {boolean}         editMode      - whether drag/resize is enabled
 * @param {Function}        onLayoutChange - callback(items) when layout changes
 *
 * @returns {{ gridInstance: React.RefObject }}
 */
export function useGridStack(gridRef, layout, editMode, onLayoutChange) {
  const gridInstance = useRef(null);
  // Store the latest callbacks in refs so the GridStack event handlers
  // always invoke the current version without causing effect re-runs.
  const onLayoutChangeRef = useRef(onLayoutChange);
  onLayoutChangeRef.current = onLayoutChange;
  const editModeRef = useRef(editMode);
  editModeRef.current = editMode;

  /**
   * Extract the current layout items from the GridStack instance.
   */
  const getCurrentItems = useCallback(() => {
    if (!gridInstance.current) return [];
    const saved = gridInstance.current.save(false);
    if (!Array.isArray(saved)) return [];
    return saved.map((item) => ({
      id: item.id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));
  }, []);

  // Main effect: rebuild the grid whenever layout changes
  useEffect(() => {
    const container = gridRef.current;
    if (!container) return;

    const GS = window.GridStack;
    if (!GS) {
      console.warn('GridStack not loaded from CDN. Widget grid will not render.');
      return;
    }

    // -- Destroy existing instance --
    if (gridInstance.current) {
      try {
        gridInstance.current.destroy(false);
      } catch {
        // ignore
      }
      gridInstance.current = null;
    }

    // -- Clear the container --
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // -- Empty layout: show placeholder --
    if (!layout || layout.length === 0) {
      container.appendChild(buildEmptyState());
      return;
    }

    // -- Build DOM elements with gs-* attributes --
    for (const w of layout) {
      const def = WIDGET_REGISTRY[w.id];
      if (!def) continue;

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
      contentEl.appendChild(buildItemContent(w.id));
      itemEl.appendChild(contentEl);

      container.appendChild(itemEl);
    }

    // -- Initialize GridStack --
    const grid = GS.init({
      column: 12,
      cellHeight: 80,
      margin: 8,
      animate: true,
      float: false,
      staticGrid: !editModeRef.current,
      disableResize: !editModeRef.current,
      draggable: {
        handle: '.widget-card__drag-handle',
      },
      columnOpts: {
        breakpoints: [
          { c: 12, w: 1200 },
          { c: 8,  w: 996 },
          { c: 4,  w: 768 },
          { c: 1,  w: 480 },
        ],
        layout: 'list',
      },
    }, container);

    gridInstance.current = grid;

    // -- Hook resizestop: update logical size attribute, notify parent --
    grid.on('resizestop', (_event, el) => {
      if (!el || !el.gridstackNode) return;
      const node = el.gridstackNode;
      const newLogical = getLogicalSize(node.w);
      el.setAttribute('data-logical-size', newLogical);

      if (onLayoutChangeRef.current) {
        onLayoutChangeRef.current(getCurrentItems());
      }
    });

    // -- Hook change: auto-save on any move/resize --
    grid.on('change', () => {
      // Update logical size attributes for all items
      container.querySelectorAll('.grid-stack-item').forEach((el) => {
        if (el.gridstackNode) {
          el.setAttribute('data-logical-size', getLogicalSize(el.gridstackNode.w));
        }
      });

      if (onLayoutChangeRef.current) {
        onLayoutChangeRef.current(getCurrentItems());
      }
    });

    // -- Cleanup on unmount --
    return () => {
      if (gridInstance.current) {
        try {
          gridInstance.current.destroy(false);
        } catch {
          // ignore
        }
        gridInstance.current = null;
      }
    };
    // Re-run when layout identity changes (new array ref from parent).
    // editMode changes are handled separately below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  // Separate effect: toggle static mode when editMode changes
  // without tearing down and rebuilding the entire grid.
  useEffect(() => {
    if (gridInstance.current) {
      gridInstance.current.setStatic(!editMode);
    }
  }, [editMode]);

  return { gridInstance };
}
