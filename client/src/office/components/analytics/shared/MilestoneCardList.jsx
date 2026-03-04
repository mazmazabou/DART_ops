import React, { useEffect, useRef } from 'react';
import EmptyState from './EmptyState.jsx';

const BADGE_THRESHOLDS = [50, 100, 250, 500, 1000];

const BADGE_ICONS = {
  50: 'ti-star',
  100: 'ti-award',
  250: 'ti-trophy',
  500: 'ti-crown',
  1000: 'ti-diamond',
};

function getBadgeLabels(orgShortName) {
  return {
    50: 'Rising Star',
    100: 'Century Club',
    250: 'Quarter Thousand',
    500: `${orgShortName} Legend`,
    1000: 'Diamond',
  };
}

/**
 * MilestoneCardList — milestone badges + animated progress bars.
 *
 * @param {Array} people - Array from the milestones API. Each entry has:
 *   { name, rideCount, achievedMilestones: number[], nextMilestone: number|null }
 * @param {'driver'|'rider'} type
 * @param {string} [orgShortName='RideOps']
 */
export default function MilestoneCardList({ people, type, orgShortName = 'RideOps' }) {
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    // Animate progress bars: set width to target after mount
    requestAnimationFrame(() => {
      const bars = listRef.current.querySelectorAll('.progress-bar-fill[data-target]');
      bars.forEach((bar) => {
        bar.style.width = bar.dataset.target + '%';
      });
    });
  }, [people]);

  if (!people || !people.length) {
    return (
      <EmptyState
        icon="trophy-off"
        title={`No ${type} data`}
        message="No completed rides yet."
      />
    );
  }

  const badgeLabels = getBadgeLabels(orgShortName);

  return (
    <div className="milestone-list" ref={listRef}>
      {people.map((p, idx) => {
        const pct = p.nextMilestone
          ? Math.max(Math.min((p.rideCount / p.nextMilestone) * 100, 100), 2).toFixed(1)
          : 100;
        const label = p.nextMilestone
          ? `${p.rideCount} / ${p.nextMilestone} rides`
          : 'All milestones achieved!';

        return (
          <div key={idx} className="milestone-card">
            <div className="milestone-name">{p.name}</div>
            <div className="milestone-count">{p.rideCount} completed rides</div>
            <div className="milestone-badges">
              {BADGE_THRESHOLDS.map((m) => {
                const earned = p.achievedMilestones && p.achievedMilestones.includes(m);
                return (
                  <span
                    key={m}
                    className={`milestone-badge${earned ? ' earned' : ''}`}
                    title={badgeLabels[m]}
                  >
                    <i className={`ti ${BADGE_ICONS[m]}`}></i> {m}
                  </span>
                );
              })}
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: '0%' }}
                data-target={pct}
              />
            </div>
            <div className="progress-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
