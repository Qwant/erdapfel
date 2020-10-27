import React from 'react';
import RoadMapStep from './RoadMapStep';
import RoadMapPoint from './RoadMapPoint';
import { getAllSteps } from 'src/libs/route_utils';
import PublicTransportRoadMap from './PublicTransportRoadMap';
import { fire } from 'src/libs/customEvents';

const RoadMap = ({ route, origin, destination, vehicle }) => {
  if (vehicle === 'publicTransport') {
    return <PublicTransportRoadMap route={route} origin={origin} destination={destination} />;
  }

  return <div className="itinerary_roadmap">
    <RoadMapPoint point={origin} icon="origin" />
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
