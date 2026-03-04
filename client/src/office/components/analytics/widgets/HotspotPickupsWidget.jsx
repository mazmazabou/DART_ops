import React from 'react';
import HotspotBarList from '../shared/HotspotBarList.jsx';
import { getCampusPalette } from '../../../../utils/campus';
import { getCampusSlug } from '../../../../utils/campus';

/**
 * HotspotPickupsWidget -- ranked horizontal bar chart for top pickup locations.
 *
 * @param {{ items: Array<{location: string, count: number}> }} props
 */
export default function HotspotPickupsWidget({ items }) {
  const slug = getCampusSlug();
  const palette = getCampusPalette(slug);

  const mapped = (items || []).map((item) => ({
    name: item.location || item.name || '',
    count: item.count,
  }));

  return <HotspotBarList items={mapped} palette={palette} />;
}
