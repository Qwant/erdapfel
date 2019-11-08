import React, { useState, Fragment } from 'react';
import { formatDistance } from 'src/libs/route_utils';
import RoadMapStep from './RoadMapStep';

const WalkLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  // @TODO: build and translate a complete summary
  const summary = `Walk on ${formatDistance(leg.distance)}`;

  return <Fragment>
    <div className="itinerary_roadmap_step">
      <div className="itinerary_roadmap_icon" />
      <div className="itinerary_roadmap_instruction" onClick={() => setDetailsOpen(!detailsOpen)}>
        {summary} <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />
      </div>
      <div className="itinerary_roadmap_distance" />
    </div>
    {detailsOpen && leg.steps.map((step, index) => <RoadMapStep key={index} step={step} />)}
  </Fragment>;
};

export default WalkLeg;
