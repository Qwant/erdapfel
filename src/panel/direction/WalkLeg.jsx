import React from 'react';
import { formatDistance } from 'src/libs/route_utils';

const WalkLeg = ({ leg }) => {
  const summary = `Walk on ${formatDistance(leg.distance)}`;

  return <div className="itinerary_roadmap_step">
    <div className="itinerary_roadmap_icon" />
    <div className="itinerary_roadmap_instruction">{summary}</div>
    <div className="itinerary_roadmap_distance" />
  </div>;
};

export default WalkLeg;
