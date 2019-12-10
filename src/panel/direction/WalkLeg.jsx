import React, { useState } from 'react';
import { formatDistance } from 'src/libs/route_utils';
import RoadMapItem from './RoadMapItem';
import LegLine from './LegLine';

const WalkLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  // @TODO: build and translate a complete summary
  const summary = `Walk on ${formatDistance(leg.distance)}`;
  const hasSteps = leg.steps.length > 1;

  return <RoadMapItem
    icon="walk"
    className="itinerary_roadmap_item--walk"
    line={<LegLine mode="WALK" />}
  >
    <div
      className="itinerary_roadmap_item_summary"
      onClick={() => { if (hasSteps) { setDetailsOpen(!detailsOpen); } } }
    >
      <div>{summary}</div>
      {hasSteps && <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />}
    </div>
    {detailsOpen && <div className="itinerary_roadmap_substeps">
      {leg.steps.map((step, index) => <div key={index}>
        {step.maneuver.instruction}
      </div>)}
    </div>}
  </RoadMapItem>;
};

export default WalkLeg;
