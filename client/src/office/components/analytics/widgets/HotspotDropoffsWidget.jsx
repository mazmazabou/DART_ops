import React from 'react';
import HotspotBarList from '../shared/HotspotBarList.jsx';
import { getCampusPalette, getCampusSlug } from '../../../../utils/campus';

/**
 * HotspotDropoffsWidget -- ranked horizontal bar chart for top dropoff locations.
 *
 * @param {{ items: Array<{location: string, count: number}> }} props
 */
export default function HotspotDropoffsWidget({ items }) {
  const slug = getCampusSlug();
  const palette = getCampusPalette(slug);

  const mapped = (items || []).map((item) => ({
    name: item.location || item.name || '',
    count: item.count,
  }));

  return <HotspotBarList items={mapped} palette={palette} />;
}
