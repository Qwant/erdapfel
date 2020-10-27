/* global _ */
import React, { useState } from 'react';
import { formatDistance, formatDuration, getStepIcon } from 'src/libs/route_utils';
import RoadMapItem from './RoadMapItem';
import LegLine from './LegLine';
import classnames from 'classnames';

const WalkLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  const summary = _('Walk on {walkDistance}', 'direction', {
    walkDistance: formatDistance(leg.distance),
  });
  const hasSteps = leg.steps.length > 1;

  return <RoadMapItem
    iconClass="walk"
    className="itinerary_roadmap_item--walk"
    line={<LegLine mode="WALK" />}
    distance={formatDuration(leg.duration)}
  >
    <div
      className={classnames('itinerary_roadmap_item_summary', {
        'itinerary_roadmap_item_summary--openable': hasSteps,
      })}
      onClick={() => { if (hasSteps) { setDetailsOpen(!detailsOpen); } } }
    >
      <div>{summary}</div>
      {hasSteps && <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />}
    </div>
    {detailsOpen && <div className="itinerary_roadmap_substeps">
      {leg.steps.map((step, index) => <div key={index} className="itinerary_roadmap_substep">
        <div className={`itinerary_roadmap_icon itinerary_roadmap_icon_${getStepIcon(step)}`} />
        <div>{step.maneuver.instruction}</div>
      </div>)}
    </div>}
  </RoadMapItem>;
};

export default WalkLeg;
