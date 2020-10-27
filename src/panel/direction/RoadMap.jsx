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

  const routeSteps = getAllSteps(route);
  // Mapbox roadmaps include the destination point as the last maneuver,
  // but we want a custom format for it, so let's ignore it.
  routeSteps.pop();

  return <div className="itinerary_roadmap">
    <RoadMapPoint point={origin} icon="origin" />
    {routeSteps.map((step, index) => <RoadMapStep
      key={index}
      step={step}
      onMouseOver={() => { fire('highlight_step', index); }}
      onMouseOut={() => { fire('unhighlight_step', index); }}
      onClick={() => { fire('zoom_step', step); }}
    />)}
    <RoadMapPoint point={destination} icon="arrive" />
  </div>;
};

export default RoadMap;
