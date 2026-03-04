import React from 'react';
import MilestoneCardList from '../shared/MilestoneCardList.jsx';

/**
 * RiderMilestonesWidget -- milestone badges and progress bars for riders.
 *
 * @param {{ people: Array, orgShortName: string }} props
 */
export default function RiderMilestonesWidget({ people, orgShortName = 'RideOps' }) {
  return (
    <MilestoneCardList
      people={people}
      type="rider"
      orgShortName={orgShortName}
    />
  );
}
