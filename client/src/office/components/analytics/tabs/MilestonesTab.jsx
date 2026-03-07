import { useState, useEffect, useCallback } from 'react';
import { fetchAnalytics } from '../hooks/useAnalyticsFetch';
import { useTenant } from '../../../../contexts/TenantContext';
import SkeletonLoader from '../shared/SkeletonLoader';

import DriverMilestonesWidget from '../widgets/DriverMilestonesWidget';
import RiderMilestonesWidget from '../widgets/RiderMilestonesWidget';

export default function MilestonesTab() {
  const { config } = useTenant();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orgShortName = config?.orgShortName || 'RideOps';

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const milestones = await fetchAnalytics('milestones', {});
      setData(milestones);
    } catch (e) {
      console.warn('Milestones fetch error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="milestones-page">
      <section className="milestones-section">
        <h3 className="milestones-section__title">
          <i className="ti ti-trophy" /> Driver Milestones
        </h3>
        {loading
          ? <SkeletonLoader type="chart" />
          : <DriverMilestonesWidget people={data?.drivers} orgShortName={orgShortName} />
        }
      </section>
      <section className="milestones-section">
        <h3 className="milestones-section__title">
          <i className="ti ti-award" /> Rider Milestones
        </h3>
        {loading
          ? <SkeletonLoader type="chart" />
          : <RiderMilestonesWidget people={data?.riders} orgShortName={orgShortName} />
        }
      </section>
    </div>
  );
}
