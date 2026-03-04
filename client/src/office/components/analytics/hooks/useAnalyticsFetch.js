/**
 * Analytics data fetching utilities with date-range caching.
 *
 * This is a plain JS module (not a React hook) exporting stateless fetch
 * functions and a simple in-memory cache keyed by endpoint + date range.
 */

// -- In-memory cache --
const _cache = new Map();

/**
 * Build a cache key from an endpoint name and date range.
 */
function cacheKey(endpoint, dateRange) {
  const from = dateRange?.from || '';
  const to = dateRange?.to || '';
  return endpoint + '|' + from + '|' + to;
}

/**
 * Build the query string for a date-range filter.
 */
function dateQueryString(dateRange) {
  const parts = [];
  if (dateRange?.from) parts.push('from=' + encodeURIComponent(dateRange.from));
  if (dateRange?.to) parts.push('to=' + encodeURIComponent(dateRange.to));
  return parts.length > 0 ? '?' + parts.join('&') : '';
}

/**
 * Fetch a single analytics endpoint with date-range filtering and caching.
 *
 * @param {string} endpoint   - endpoint name (e.g. 'summary', 'frequency', 'hotspots')
 * @param {object} dateRange  - { from?: string, to?: string } ISO date strings
 * @param {object} [options]  - { noCache?: boolean } to bypass the cache
 * @returns {Promise<object>} - parsed JSON response
 * @throws {Error} on non-ok response or network failure
 */
export async function fetchAnalytics(endpoint, dateRange, options = {}) {
  const key = cacheKey(endpoint, dateRange);

  if (!options.noCache && _cache.has(key)) {
    return _cache.get(key);
  }

  const url = '/api/analytics/' + endpoint + dateQueryString(dateRange);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Analytics request failed: ' + endpoint);
  }

  const data = await res.json();
  _cache.set(key, data);
  return data;
}

/**
 * Fetch multiple analytics endpoints in parallel with caching.
 *
 * @param {string[]} endpoints - array of endpoint names
 * @param {object}   dateRange - { from?: string, to?: string }
 * @param {object}   [options] - { noCache?: boolean }
 * @returns {Promise<object>}  - { [endpoint]: data } keyed by endpoint name
 */
export async function fetchAllAnalytics(endpoints, dateRange, options = {}) {
  const entries = await Promise.all(
    endpoints.map(async (ep) => {
      try {
        const data = await fetchAnalytics(ep, dateRange, options);
        return [ep, data];
      } catch (err) {
        console.warn('Analytics fetch failed for', ep, err);
        return [ep, null];
      }
    })
  );
  return Object.fromEntries(entries);
}

/**
 * Clear all cached analytics data.
 * Call this when the user changes date range or explicitly refreshes.
 */
export function clearAnalyticsCache() {
  _cache.clear();
}

/**
 * Clear cached data for a specific endpoint and date range.
 *
 * @param {string} endpoint  - endpoint name
 * @param {object} dateRange - { from?: string, to?: string }
 */
export function clearEndpointCache(endpoint, dateRange) {
  _cache.delete(cacheKey(endpoint, dateRange));
}

/**
 * Download an Excel report as a file.
 *
 * Fetches the export-report endpoint as a blob and triggers a browser download.
 *
 * @param {object} dateRange - { from?: string, to?: string }
 * @param {string} [filename] - download filename (default: 'RideOps-Report.xlsx')
 * @returns {Promise<void>}
 * @throws {Error} on non-ok response
 */
export async function downloadExcelReport(dateRange, filename = 'RideOps-Report.xlsx') {
  const url = '/api/analytics/export-report' + dateQueryString(dateRange);
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Report download failed');
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
