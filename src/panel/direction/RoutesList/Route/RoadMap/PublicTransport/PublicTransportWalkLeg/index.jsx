/* globals _ */

import React, { useState } from 'react';
import { formatDistance, formatDuration } from 'src/libs/route_utils';
import PublicTransportRoadMapItem from '../PublicTransportRoadMapItem';
import RoadMapIcon from '../../Default/DefaultRoadMapIcon';
import DefaultLegLine from '../../Default/DefaultLegLine';
import cx from 'classnames';
import { Chevron } from 'src/components/ui';
import { walkingManeuver } from 'src/libs/route_utils';

const PublicTransportWalkLeg = ({ leg }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const summary = _('Walk on {walkDistance}', 'direction', {
    walkDistance: formatDistance(leg.distance),
  });
  const hasSteps = leg.steps.length > 1;

  return (
    <PublicTransportRoadMapItem
      icon={<RoadMapIcon iconClass="walk" />}
      className={cx(
        'itinerary_roadmap_item--walk',
        !hasSteps && 'itinerary_roadmap_item--no-hover'
      )}
      line={<DefaultLegLine mode="WALK" />}
      distance={formatDuration(leg.duration)}
      type="WALK"
    >
      <div
        className={cx('itinerary_roadmap_item_summary', {
          'itinerary_roadmap_item_summary--openable': hasSteps,
        })}
        onClick={() => {
          if (hasSteps) {
            setDetailsOpen(!detailsOpen);
          }
        }}
      >
        <div>{summary}</div>
        {hasSteps && <Chevron up={detailsOpen} />}
      </div>
      {detailsOpen && (
        <div className="itinerary_roadmap_substeps">
          {leg.steps.map((step, index) => (
            <div key={index} className="itinerary_roadmap_substep">
              <div>{step.maneuver.instruction || walkingManeuver(step.maneuver)}</div>
            </div>
          ))}
        </div>
      )}
    </PublicTransportRoadMapItem>
  );
};

export default PublicTransportWalkLeg;
