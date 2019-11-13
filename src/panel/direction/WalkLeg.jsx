import React, { useState, Fragment } from 'react';
import { formatDistance } from 'src/libs/route_utils';
import RoadMapStep from './RoadMapStep';
import RoadMapItem from './RoadMapItem';

const WalkLeg = ({ leg }) => {
  const [ detailsOpen, setDetailsOpen ] = useState(false);
  // @TODO: build and translate a complete summary
  const summary = `Walk on ${formatDistance(leg.distance)}`;

  return <Fragment>
    <RoadMapItem icon="walk">
      <div
        className="itinerary_roadmap_item_summary"
        onClick={() => setDetailsOpen(!detailsOpen)}
      >
        <div>{summary}</div>
        <span className={`icon-icon_chevron-${detailsOpen ? 'up' : 'down'}`} />
      </div>
    </RoadMapItem>
    {detailsOpen && leg.steps.map((step, index) => <RoadMapStep key={index} step={step} />)}
  </Fragment>;
};

export default WalkLeg;
