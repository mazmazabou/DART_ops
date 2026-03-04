import React from 'react';
import EmptyState from './EmptyState.jsx';

/**
 * HotspotBarList — ranked horizontal bar chart for top locations / routes.
 *
 * @param {Array<{name: string, count: number|string}>} items
 * @param {string[]} palette - Array of hex color strings, cycled for bar fills
 */
export default function HotspotBarList({ items, palette }) {
  if (!items || !items.length) {
    return (
      <EmptyState
        icon="map-pin-off"
        title="No data"
        message="No location data available."
      />
    );
  }

  const parsedItems = items.map((item) => ({
    ...item,
    count: parseInt(item.count, 10) || 0,
  }));

  const max = Math.max(...parsedItems.map((i) => i.count));
  const colors = palette && palette.length ? palette : ['var(--color-primary)'];

  return (
    <div className="hotspot-list">
      {parsedItems.map((item, idx) => {
        const pct = max > 0 ? (item.count / max) * 100 : 0;
        const barColor = colors[idx % colors.length];

        return (
          <div key={idx} className="hotspot-item">
            <div className="hotspot-rank">#{idx + 1}</div>
            <div className="hotspot-name" title={item.name}>
              {item.name}
            </div>
            <div className="hotspot-bar">
              <div
                className="hotspot-bar-fill"
                style={{ width: `${pct}%`, background: barColor }}
              />
            </div>
            <div className="hotspot-count">{item.count}</div>
          </div>
        );
      })}
    </div>
  );
}
