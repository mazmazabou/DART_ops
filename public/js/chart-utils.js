// chart-utils.js — Chart.js registry, color resolution, skeleton loaders, sortable tables
// Loaded before analytics.js and app.js. All functions are globals.

// ============================================================================
// CHART.JS INSTANCE REGISTRY
// ============================================================================
// Chart.js requires destroying existing instances before re-rendering into the
// same canvas. This registry tracks instances by container ID.
var _chartInstances = {};

function destroyChart(containerId) {
  if (_chartInstances[containerId]) {
    _chartInstances[containerId].destroy();
    delete _chartInstances[containerId];
  }
}

// Resolve CSS variables to actual hex/rgb values for Chart.js canvas rendering
function resolveColor(cssVar) {
  if (!cssVar || !cssVar.startsWith('var(')) return cssVar;
  var propName = cssVar.replace(/^var\(/, '').replace(/\)$/, '').trim();
  return getComputedStyle(document.documentElement).getPropertyValue(propName).trim() || cssVar;
}

// Analytics skeleton loading states
function showAnalyticsSkeleton(containerId, type) {
  var el = document.getElementById(containerId);
  if (!el) return;
  if (type === 'chart') {
    el.innerHTML = '<div class="analytics-skeleton" style="height:200px;display:flex;align-items:flex-end;gap:8px;padding:16px;">' +
      '<div style="flex:1;background:var(--color-border);border-radius:4px 4px 0 0;height:40%;opacity:0.4;"></div>' +
      '<div style="flex:1;background:var(--color-border);border-radius:4px 4px 0 0;height:70%;opacity:0.5;"></div>' +
      '<div style="flex:1;background:var(--color-border);border-radius:4px 4px 0 0;height:55%;opacity:0.4;"></div>' +
      '<div style="flex:1;background:var(--color-border);border-radius:4px 4px 0 0;height:85%;opacity:0.6;"></div>' +
      '<div style="flex:1;background:var(--color-border);border-radius:4px 4px 0 0;height:45%;opacity:0.4;"></div>' +
      '</div>';
  } else if (type === 'table') {
    el.innerHTML = '<div class="analytics-skeleton" style="padding:16px;">' +
      '<div class="analytics-skeleton__bar analytics-skeleton__bar--full"></div>' +
      '<div class="analytics-skeleton__bar analytics-skeleton__bar--long"></div>' +
      '<div class="analytics-skeleton__bar analytics-skeleton__bar--medium"></div>' +
      '<div class="analytics-skeleton__bar analytics-skeleton__bar--short"></div>' +
      '<div class="analytics-skeleton__bar analytics-skeleton__bar--long"></div>' +
      '</div>';
  } else if (type === 'donut') {
    el.innerHTML = '<div class="analytics-skeleton" style="height:200px;display:flex;align-items:center;justify-content:center;">' +
      '<div style="width:140px;height:140px;border-radius:50%;border:24px solid var(--color-border);opacity:0.4;"></div>' +
      '</div>';
  } else if (type === 'heatmap') {
    el.innerHTML = '<div class="analytics-skeleton" style="height:280px;padding:16px;display:grid;grid-template-columns:60px repeat(5, 1fr);gap:4px;">' +
      Array(66).fill('<div style="background:var(--color-border);border-radius:3px;opacity:0.3;"></div>').join('') +
      '</div>';
  } else if (type === 'kpi') {
    el.innerHTML = Array(6).fill(
      '<div class="kpi-card kpi-card--neutral" style="opacity:0.5;">' +
      '<div class="kpi-card__value" style="background:var(--color-border);width:40px;height:28px;border-radius:4px;margin:0 auto;"></div>' +
      '<div class="kpi-card__label" style="background:var(--color-border);width:80px;height:12px;border-radius:4px;margin:8px auto 0;"></div>' +
      '</div>'
    ).join('');
  }
}

// Make analytics table headers sortable on click
function makeSortable(tableElement) {
  if (!tableElement) return;
  var headers = tableElement.querySelectorAll('thead th');
  headers.forEach(function(th, colIdx) {
    th.classList.add('sortable-header');
    th.addEventListener('click', function() {
      var tbody = tableElement.querySelector('tbody');
      var rows = Array.from(tbody.querySelectorAll('tr'));
      var currentDir = th.dataset.sortDir === 'asc' ? 'desc' : 'asc';

      // Reset other headers
      headers.forEach(function(h) { h.removeAttribute('data-sort-dir'); });
      th.dataset.sortDir = currentDir;

      rows.sort(function(a, b) {
        var aText = (a.cells[colIdx] ? a.cells[colIdx].textContent.trim().replace('%', '') : '');
        var bText = (b.cells[colIdx] ? b.cells[colIdx].textContent.trim().replace('%', '') : '');
        var aNum = parseFloat(aText);
        var bNum = parseFloat(bText);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return currentDir === 'asc' ? aNum - bNum : bNum - aNum;
        }
        return currentDir === 'asc' ? aText.localeCompare(bText) : bText.localeCompare(aText);
      });

      rows.forEach(function(r) { tbody.appendChild(r); });
    });
  });
}
