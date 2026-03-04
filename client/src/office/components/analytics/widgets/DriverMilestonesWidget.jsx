import React from 'react';
import MilestoneCardList from '../shared/MilestoneCardList.jsx';

/**
 * DriverMilestonesWidget -- milestone badges and progress bars for drivers.
 *
 * @param {{ people: Array, orgShortName: string }} props
 */
export default function DriverMilestonesWidget({ people, orgShortName = 'RideOps' }) {
  return (
    <MilestoneCardList
      people={people}
      type="driver"
      orgShortName={orgShortName}
    />
  );
}
