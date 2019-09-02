import React from 'react';
import { formatDistance, getStepIcon } from 'src/libs/route_utils';

const RoadMapStep = ({ step, ...rest }) =>
  <div className="itinerary_roadmap_step" {...rest}>
    <div className={`itinerary_roadmap_icon itinerary_roadmap_icon_${getStepIcon(step)}`} />
    <div className="itinerary_roadmap_instruction">{step.maneuver.instruction}</div>
    <div className="itinerary_roadmap_distance">
      {step.distance ? formatDistance(step.distance) : null}
    </div>
  </div>;

export default RoadMapStep;
