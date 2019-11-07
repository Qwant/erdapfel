/* global _ */
import React from 'react';
import RoadMapStep from './RoadMapStep';
import { getAllSteps } from 'src/libs/route_utils';
import PublicTransportRoadMap from './PublicTransportRoadMap';

const RoadMap = ({ route, origin, destination, vehicle }) => {
  if (vehicle === 'publicTransport') {
    return <PublicTransportRoadMap route={route} origin={origin} destination={destination} />;
  }

  return <div className="itinerary_roadmap">
    <div className="itinerary_roadmap_step">
      <div className="itinerary_roadmap_icon itinerary_roadmap_icon_origin" />
      <div className="itinerary_roadmap_instruction">{`${_('Start')} ${origin}`}</div>
      <div className="itinerary_roadmap_distance" />
    </div>
    {getAllSteps(route).map((step, index) => <RoadMapStep
      key={index}
      step={step}
      onMouseOver={() => { fire('highlight_step', index); }}
      onMouseOut={() => { fire('unhighlight_step', index); }}
      onClick={() => { fire('zoom_step', step); }}
    />)}
  </div>;
};

export default RoadMap;
