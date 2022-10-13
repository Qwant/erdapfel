import React, { useMemo } from 'react';
import { getAllSteps } from 'src/libs/route_utils';
import PublicTransportRoadMap from './PublicTransport/PublicTransportRoadMap';
import DefaultRoadMap from './Default/DefaultRoadMap';

const RoadMap = ({ route, origin, destination, vehicle }) => {
  /* Mapbox roadmaps include the destination point as the last maneuver,
   * but we want a custom format for it, so let's ignore it. */
  const routeSteps = useMemo(() => {
    const steps = getAllSteps(route);
    return steps?.splice(0, steps.length - 1);
  }, [route]);

  switch (vehicle) {
    case 'publicTransport':
      return <PublicTransportRoadMap route={route} origin={origin} destination={destination} />;
    default:
      return <DefaultRoadMap routeSteps={routeSteps} origin={origin} destination={destination} />;
  }
};

export default RoadMap;
