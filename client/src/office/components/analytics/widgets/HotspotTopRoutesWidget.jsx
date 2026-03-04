import React from 'react';
import HotspotBarList from '../shared/HotspotBarList.jsx';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

/**
 * HotspotTopRoutesWidget -- ranked horizontal bar chart for top routes.
 *
 * @param {{ items: Array<{route: string, location: string, count: number}> }} props
 */
export default function HotspotTopRoutesWidget({ items }) {
  const slug = getCampusSlug();
  const palette = getCampusPalette(slug);

  const mapped = (items || []).map((item) => ({
    name: item.route || item.location || item.name || '',
    count: item.count,
  }));

  return <HotspotBarList items={mapped} palette={palette} />;
}
