/* Widget System — manages analytics widget dashboards (multi-tab) */
/* Depends on: widget-registry.js (WIDGET_REGISTRY, DEFAULT_WIDGET_LAYOUT, WIDGET_CATEGORIES) */
/* Depends on: SortableJS (optional — degrades gracefully if CDN fails) */

var WIDGET_LAYOUT_VERSION = 2;
var WIDGET_SIZE_LABELS = { xs: 'Compact', sm: 'Small', md: 'Medium', lg: 'Full' };
var _widgetLoaders = {};
var _widgetInstances = {};   // keyed by tabId
var _activeWidgetTab = null; // tracks which tab the library drawer should operate on

// ── Widget Registration ──

function registerWidgetLoader(widgetId, loaderFn) {
  _widgetLoaders[widgetId] = loaderFn;
}

// ── Multi-Instance Factory ──

function createWidgetInstance(tabId, config) {
  // config: {
  //   gridId: string          -- DOM id of the grid container
  //   storagePrefix: string   -- localStorage key prefix
  //   defaultLayout: array    -- default widget layout for this tab
  //   allowedWidgets: array|null  -- widget IDs allowed on this tab (null = all)
  //   containerOverrides: object|null -- { widgetId: 'alt-container-id' }
  //   toolbarIds: { customize, toolbar, done, add, reset }
  // }
  var instance = {
    tabId: tabId,
    config: config,
    layout: null,
    editMode: false,
    sortable: null,
    userId: null
  };
  _widgetInstances[tabId] = instance;
  return instance;
}

// ── Layout Persistence ──

function getWidgetStorageKey(storagePrefix, userId) {
  return 'rideops_widget_layout_' + storagePrefix + '_' + (userId || 'default');
}

function loadWidgetLayout(storagePrefix, userId) {
  try {
    var raw = localStorage.getItem(getWidgetStorageKey(storagePrefix, userId));
    if (!raw) return null;
    var saved = JSON.parse(raw);
    if (!saved || saved.version !== WIDGET_LAYOUT_VERSION || !Array.isArray(saved.widgets)) return null;
    saved.widgets = saved.widgets.filter(function(w) { return WIDGET_REGISTRY[w.id]; });
    return saved.widgets;
  } catch (e) {
    return null;
  }
}

function saveWidgetLayout(storagePrefix, userId, layout) {
  try {
    localStorage.setItem(getWidgetStorageKey(storagePrefix, userId), JSON.stringify({
      version: WIDGET_LAYOUT_VERSION,
      widgets: layout
    }));
  } catch (e) {
    console.warn('Failed to save widget layout:', e);
  }
}

// ── Widget Grid Rendering ──

function getVisibleWidgetIds(tabId) {
  var inst = _widgetInstances[tabId || 'dashboard'];
  if (!inst || !inst.layout) return [];
  return inst.layout.map(function(w) { return w.id; });
}

function buildWidgetCardHTML(widgetId, size, containerOverrides) {
  var def = WIDGET_REGISTRY[widgetId];
  if (!def) return '';
  var actualSize = size || def.defaultSize;
  var sizeClass = 'widget-card--' + actualSize;
  var canResize = def.allowedSizes && def.allowedSizes.length > 1;
  var bodyId = (containerOverrides && containerOverrides[widgetId]) || def.containerId;
  var bodyClass = def.containerClass ? ' ' + def.containerClass : '';
  var sizeLabel = WIDGET_SIZE_LABELS[actualSize] || actualSize;

  // Widget card HTML is constructed from developer-defined registry data (title, icon,
  // description) — not user input. Safe for innerHTML construction.
  return '<div class="widget-card ' + sizeClass + '" data-widget-id="' + widgetId + '" data-size="' + actualSize + '">' +
    '<div class="widget-card__header">' +
      '<div class="widget-card__drag-handle"><i class="ti ti-grip-vertical"></i></div>' +
      '<h4 class="widget-card__title"><i class="ti ' + def.icon + '"></i> ' + def.title + '</h4>' +
      '<span class="widget-card__size-badge">' + sizeLabel + '</span>' +
      '<div class="widget-card__actions">' +
        (canResize ? '<button class="widget-action widget-action--resize" title="Resize"><i class="ti ti-arrows-diagonal"></i></button>' : '') +
        '<button class="widget-action widget-action--remove" title="Remove"><i class="ti ti-x"></i></button>' +
      '</div>' +
    '</div>' +
    '<div class="widget-card__body' + bodyClass + '" id="' + bodyId + '"></div>' +
  '</div>';
}

function renderWidgetGrid(tabId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;

  var grid = document.getElementById(inst.config.gridId);
  if (!grid) return;

  if (!inst.layout || inst.layout.length === 0) {
    // Note: widget card HTML is constructed from registry data (title, icon, description)
    // which is developer-defined static content, not user input. Safe for innerHTML.
    grid.innerHTML = '<div class="ro-empty"><i class="ti ti-layout-dashboard"></i>' +
      '<div class="ro-empty__title">No widgets on this tab</div>' +
      '<div class="ro-empty__message">Click "Customize" to add widgets.</div></div>';
    return;
  }

  var overrides = inst.config.containerOverrides || null;
  var html = '';
  inst.layout.forEach(function(w) {
    html += buildWidgetCardHTML(w.id, w.size, overrides);
  });
  grid.innerHTML = html;

  // Bind remove and resize buttons
  grid.querySelectorAll('.widget-action--remove').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var card = btn.closest('.widget-card');
      var widgetId = card.dataset.widgetId;
      removeWidget(tabId, widgetId);
    });
  });

  grid.querySelectorAll('.widget-action--resize').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var card = btn.closest('.widget-card');
      var widgetId = card.dataset.widgetId;
      resizeWidget(tabId, widgetId);
    });
  });

  initWidgetSortable(tabId);
}

// ── Widget Library (shared drawer, filtered by active tab) ──

function renderWidgetLibrary(tabId) {
  tabId = tabId || _activeWidgetTab || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;

  var list = document.getElementById('widget-library-list');
  if (!list) return;

  var visibleIds = new Set(getVisibleWidgetIds(tabId));
  var allowedSet = inst.config.allowedWidgets ? new Set(inst.config.allowedWidgets) : null;

  var available = Object.keys(WIDGET_REGISTRY).filter(function(id) {
    if (visibleIds.has(id)) return false;
    if (allowedSet && !allowedSet.has(id)) return false;
    return true;
  });

  if (available.length === 0) {
    list.innerHTML = '<div class="ro-empty"><i class="ti ti-check"></i>' +
      '<div class="ro-empty__title">All widgets placed</div>' +
      '<div class="ro-empty__message">Every available widget is on this tab.</div></div>';
    return;
  }

  // Group by category
  var groups = {};
  available.forEach(function(id) {
    var def = WIDGET_REGISTRY[id];
    var cat = def.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(id);
  });

  // Widget library content is built from developer-defined registry data (title, icon,
  // description) — not user input. Safe for innerHTML construction.
  var html = '';
  Object.keys(groups).forEach(function(cat) {
    var catLabel = (WIDGET_CATEGORIES && WIDGET_CATEGORIES[cat]) || cat;
    html += '<div class="widget-library-group">';
    html += '<div class="widget-library-group__label">' + catLabel + '</div>';
    groups[cat].forEach(function(id) {
      var def = WIDGET_REGISTRY[id];
      html += '<div class="widget-library-item" data-widget-id="' + id + '">' +
        '<div class="widget-library-item__icon"><i class="ti ' + def.icon + '"></i></div>' +
        '<div class="widget-library-item__info">' +
          '<div class="widget-library-item__name">' + def.title + '</div>' +
          '<div class="widget-library-item__desc">' + (def.description || '') + '</div>' +
          '<span class="widget-library-item__size">' + (WIDGET_SIZE_LABELS[def.defaultSize] || def.defaultSize) + '</span>' +
        '</div>' +
        '<button class="ro-btn ro-btn--outline ro-btn--xs widget-library-item__add" title="Add to tab"><i class="ti ti-plus"></i></button>' +
      '</div>';
    });
    html += '</div>';
  });
  list.innerHTML = html;

  // Bind add buttons
  list.querySelectorAll('.widget-library-item__add').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var item = btn.closest('.widget-library-item');
      var widgetId = item.dataset.widgetId;
      addWidget(tabId, widgetId);
    });
  });
}

function openWidgetLibrary(tabId) {
  _activeWidgetTab = tabId || 'dashboard';
  var drawer = document.getElementById('widget-library-drawer');
  var backdrop = document.getElementById('widget-library-backdrop');
  if (drawer) drawer.classList.add('open');
  if (backdrop) backdrop.classList.add('open');
  renderWidgetLibrary(tabId);
}

function closeWidgetLibrary() {
  var drawer = document.getElementById('widget-library-drawer');
  var backdrop = document.getElementById('widget-library-backdrop');
  if (drawer) drawer.classList.remove('open');
  if (backdrop) backdrop.classList.remove('open');
}

// ── Widget Operations ──

function addWidget(tabId, widgetId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  var def = WIDGET_REGISTRY[widgetId];
  if (!def) return;
  inst.layout.push({ id: widgetId, size: def.defaultSize });
  saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
  renderWidgetGrid(tabId);
  renderWidgetLibrary(tabId);
  _triggerTabReload(tabId);
}

function removeWidget(tabId, widgetId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  inst.layout = inst.layout.filter(function(w) { return w.id !== widgetId; });
  saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
  renderWidgetGrid(tabId);
  renderWidgetLibrary(tabId);
  _triggerTabReload(tabId);
}

function resizeWidget(tabId, widgetId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  var def = WIDGET_REGISTRY[widgetId];
  if (!def || !def.allowedSizes || def.allowedSizes.length < 2) return;
  var entry = inst.layout.find(function(w) { return w.id === widgetId; });
  if (!entry) return;
  var currentIdx = def.allowedSizes.indexOf(entry.size);
  var nextIdx = (currentIdx + 1) % def.allowedSizes.length;
  entry.size = def.allowedSizes[nextIdx];
  saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
  var card = document.querySelector('#' + inst.config.gridId + ' .widget-card[data-widget-id="' + widgetId + '"]');
  if (card) {
    card.className = 'widget-card widget-card--' + entry.size;
    card.dataset.size = entry.size;
    // Update size badge
    var badge = card.querySelector('.widget-card__size-badge');
    if (badge) badge.textContent = WIDGET_SIZE_LABELS[entry.size] || entry.size;
    // Flash animation for visual feedback
    card.classList.remove('widget-card--resizing');
    void card.offsetWidth; // force reflow to restart animation
    card.classList.add('widget-card--resizing');
  }
}

function resetWidgetLayout(tabId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  if (typeof showModalNew === 'function') {
    showModalNew({
      title: 'Reset Layout',
      body: 'Reset this tab to the default layout? Your customizations will be lost.',
      confirmLabel: 'Reset',
      confirmClass: 'ro-btn--danger',
      onConfirm: function() {
        inst.layout = JSON.parse(JSON.stringify(inst.config.defaultLayout));
        saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
        renderWidgetGrid(tabId);
        renderWidgetLibrary(tabId);
        _triggerTabReload(tabId);
        if (typeof showToastNew === 'function') showToastNew('Layout reset to defaults', 'success');
      }
    });
  } else {
    inst.layout = JSON.parse(JSON.stringify(inst.config.defaultLayout));
    saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
    renderWidgetGrid(tabId);
    renderWidgetLibrary(tabId);
    _triggerTabReload(tabId);
  }
}

// Helper: trigger reload for the tab after widget add/remove/reset
function _triggerTabReload(tabId) {
  if (tabId === 'dashboard' && typeof loadDashboardWidgets === 'function') {
    loadDashboardWidgets();
  } else if (tabId === 'hotspots' && typeof loadHotspotsWidgets === 'function') {
    loadHotspotsWidgets();
  } else if (tabId === 'milestones' && typeof loadMilestonesWidgets === 'function') {
    loadMilestonesWidgets();
  } else if (tabId === 'attendance' && typeof loadAttendanceWidgets === 'function') {
    loadAttendanceWidgets();
  } else if (typeof loadAllAnalytics === 'function') {
    loadAllAnalytics();
  }
}

// ── Edit Mode ──

function toggleWidgetEditMode(tabId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst) return;

  inst.editMode = !inst.editMode;
  var grid = document.getElementById(inst.config.gridId);
  var ids = inst.config.toolbarIds;
  var toolbar = ids ? document.getElementById(ids.toolbar) : null;
  var customizeBtn = ids ? document.getElementById(ids.customize) : null;

  if (grid) grid.classList.toggle('widget-grid--editing', inst.editMode);
  if (toolbar) toolbar.style.display = inst.editMode ? '' : 'none';
  if (customizeBtn) customizeBtn.style.display = inst.editMode ? 'none' : '';

  if (inst.sortable) {
    inst.sortable.option('disabled', !inst.editMode);
  }

  if (!inst.editMode) {
    closeWidgetLibrary();
  }
}

// ── SortableJS Integration ──

function initWidgetSortable(tabId) {
  tabId = tabId || 'dashboard';
  if (typeof Sortable === 'undefined') return;
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  var grid = document.getElementById(inst.config.gridId);
  if (!grid) return;

  if (inst.sortable) {
    inst.sortable.destroy();
    inst.sortable = null;
  }

  inst.sortable = new Sortable(grid, {
    handle: '.widget-card__drag-handle',
    animation: 200,
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    disabled: !inst.editMode,
    onEnd: function() {
      var newLayout = [];
      grid.querySelectorAll('.widget-card[data-widget-id]').forEach(function(card) {
        var wid = card.dataset.widgetId;
        var existing = inst.layout.find(function(w) { return w.id === wid; });
        if (existing) newLayout.push({ id: wid, size: existing.size });
      });
      inst.layout = newLayout;
      saveWidgetLayout(inst.config.storagePrefix, inst.userId, inst.layout);
    }
  });
}

// ── Data Loading ──

function loadSingleWidget(widgetId, containerId) {
  var loader = _widgetLoaders[widgetId];
  if (loader) {
    try { loader(containerId); } catch (e) { console.warn('Widget loader error:', widgetId, e); }
  }
}

function loadVisibleWidgets(tabId) {
  tabId = tabId || 'dashboard';
  var inst = _widgetInstances[tabId];
  if (!inst || !inst.layout) return;
  var overrides = inst.config.containerOverrides || {};
  inst.layout.forEach(function(w) {
    var def = WIDGET_REGISTRY[w.id];
    var cid = (overrides[w.id]) || (def ? def.containerId : null);
    var container = cid ? document.getElementById(cid) : null;
    if (container && typeof showAnalyticsSkeleton === 'function') {
      var skeletonType = 'chart';
      if (w.id === 'kpi-grid' || w.id === 'attendance-kpis') skeletonType = 'kpi';
      else if (w.id === 'peak-hours' || w.id === 'route-demand-matrix') skeletonType = 'heatmap';
      else if (w.id === 'ride-outcomes' || w.id === 'attendance-donut') skeletonType = 'donut';
      else if (['top-routes', 'driver-leaderboard', 'shift-coverage', 'punctuality-table'].indexOf(w.id) !== -1) skeletonType = 'table';
      showAnalyticsSkeleton(cid, skeletonType);
    }
  });
}

// ── Tab Initialization ──

function initTabWidgets(tabId, userId) {
  var inst = _widgetInstances[tabId];
  if (!inst) return;
  inst.userId = userId;

  // Load saved layout or use defaults
  var saved = loadWidgetLayout(inst.config.storagePrefix, userId);
  inst.layout = saved || JSON.parse(JSON.stringify(inst.config.defaultLayout));

  // Filter out widgets not allowed on this tab
  if (inst.config.allowedWidgets) {
    var allowed = new Set(inst.config.allowedWidgets);
    inst.layout = inst.layout.filter(function(w) { return allowed.has(w.id); });
  }

  // Render the grid
  renderWidgetGrid(tabId);

  // Bind edit mode controls for this tab
  var ids = inst.config.toolbarIds;
  if (!ids) return;

  var customizeBtn = document.getElementById(ids.customize);
  if (customizeBtn) {
    var newBtn = customizeBtn.cloneNode(true);
    customizeBtn.parentNode.replaceChild(newBtn, customizeBtn);
    newBtn.addEventListener('click', function() { toggleWidgetEditMode(tabId); });
    if (typeof Sortable === 'undefined') newBtn.style.display = 'none';
  }

  var doneBtn = document.getElementById(ids.done);
  if (doneBtn) {
    var newDone = doneBtn.cloneNode(true);
    doneBtn.parentNode.replaceChild(newDone, doneBtn);
    newDone.addEventListener('click', function() { toggleWidgetEditMode(tabId); });
  }

  var addBtn = document.getElementById(ids.add);
  if (addBtn) {
    var newAdd = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newAdd, addBtn);
    newAdd.addEventListener('click', function() { openWidgetLibrary(tabId); });
  }

  var resetBtn = document.getElementById(ids.reset);
  if (resetBtn) {
    var newReset = resetBtn.cloneNode(true);
    resetBtn.parentNode.replaceChild(newReset, resetBtn);
    newReset.addEventListener('click', function() { resetWidgetLayout(tabId); });
  }
}

// ── Backward-Compatible Initialization (Dashboard) ──

function initWidgetSystem(userId) {
  if (!_widgetInstances['dashboard']) {
    createWidgetInstance('dashboard', {
      gridId: 'widget-grid',
      storagePrefix: 'dashboard',
      defaultLayout: DEFAULT_WIDGET_LAYOUT,
      allowedWidgets: null,
      containerOverrides: null,
      toolbarIds: {
        customize: 'widget-customize-btn',
        toolbar: 'widget-toolbar',
        done: 'widget-done-btn',
        add: 'widget-add-btn',
        reset: 'widget-reset-btn'
      }
    });
  }
  initTabWidgets('dashboard', userId);

  // Bind shared library drawer close buttons
  var libClose = document.getElementById('widget-library-close');
  if (libClose) {
    var newClose = libClose.cloneNode(true);
    libClose.parentNode.replaceChild(newClose, libClose);
    newClose.addEventListener('click', closeWidgetLibrary);
  }

  var libBackdrop = document.getElementById('widget-library-backdrop');
  if (libBackdrop) {
    var newBackdrop = libBackdrop.cloneNode(true);
    libBackdrop.parentNode.replaceChild(newBackdrop, libBackdrop);
    newBackdrop.addEventListener('click', closeWidgetLibrary);
  }

  // Sync backward-compat globals
  _syncDashboardGlobals();
}

// ── Backward-compatible globals ──

var _widgetLayout = null;
var _widgetEditMode = false;
var _widgetGridSortable = null;
var _widgetUserId = null;

function _syncDashboardGlobals() {
  var inst = _widgetInstances['dashboard'];
  if (inst) {
    _widgetLayout = inst.layout;
    _widgetEditMode = inst.editMode;
    _widgetGridSortable = inst.sortable;
    _widgetUserId = inst.userId;
  }
}
