import React from 'react';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';

const Route = ({ id, route, icon, showDetails, toggleDetails, selectRoute, origin, isActive }) =>
  <div className={`itinerary_leg ${isActive ? 'itinerary_leg--active' : ''}`}>
    <RouteSummary id={id} route={route}
      icon={icon}
      toggleDetails={toggleDetails}
      selectRoute={selectRoute}
    />
    {showDetails && <RoadMap steps={route.steps} origin={origin} />}
  </div>;

export default Route;
