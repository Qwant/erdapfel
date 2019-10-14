import React from 'react';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';
import { getAllSteps } from 'src/libs/route_utils';

const Route = ({
  id, route, vehicle, showDetails, origin, isActive,
  openDetails, openPreview, selectRoute, hoverRoute,
}) =>
  <div className={`itinerary_leg ${isActive ? 'itinerary_leg--active' : ''}`}
    onMouseEnter={() => { hoverRoute(id, true); }}
    onMouseLeave={() => { hoverRoute(id, false); }}
  >
    <RouteSummary id={id} route={route}
      openDetails={openDetails}
      openPreview={openPreview}
      selectRoute={selectRoute}
      vehicle={vehicle}
    />
    {showDetails && <RoadMap steps={getAllSteps(route)} origin={origin} />}
  </div>;

export default Route;
