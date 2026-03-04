import React from 'react';

/**
 * EmptyState — simple empty-state placeholder for analytics widgets.
 *
 * @param {string} icon   - Tabler icon name without the `ti-` prefix (e.g. "chart-bar")
 * @param {string} title  - Bold heading
 * @param {string} message - Secondary descriptive text
 */
export default function EmptyState({ icon, title, message }) {
  return (
    <div className="ro-empty">
      <i className={`ti ti-${icon}`}></i>
      <div className="ro-empty__title">{title}</div>
      <div className="ro-empty__message">{message}</div>
    </div>
  );
}
