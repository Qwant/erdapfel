/* global _, fire */
import React from 'react';
import { formatDistance } from './routeUtils';

function getIcon(step) {
  return (step.maneuver.modifier || step.maneuver.type).replace(/\s/g, '-');
}

const RoadMapStep = ({ step, index }) =>
  <div className="itinerary_roadmap_step"
    onMouseOver={() => fire('highlight_step', index)}
    onMouseOut={() => fire('unhighlight_step', index)}
    onClick={() => fire('zoom_step', step)}
  >
    <div className={`itinerary_roadmap_icon itinerary_roadmap_icon_${getIcon(step)}`} />
    <div className="itinerary_roadmap_instruction">{step.maneuver.instruction}</div>
    <div className="itinerary_roadmap_distance">
      {step.distance ? formatDistance(step.distance) : null}
    </div>
  </div>;

const RoadMap = ({ steps = [], origin }) =>
  <div className="itinerary_roadmap">
    <div className="itinerary_roadmap_step">
      <div className="itinerary_roadmap_icon itinerary_roadmap_icon_origin">
        <div className="itinerary_icon_origin_inner" />
      </div>
      <div className="itinerary_roadmap_instruction">{`${_('Start')} ${origin}`}</div>
      <div className="itinerary_roadmap_distance" />
    </div>
    {steps.map((step, index) => <RoadMapStep
      key={index}
      step={step}
      index={index}
    />)}
  </div>;

export default RoadMap;
