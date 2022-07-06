import React, { Fragment } from 'react';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';

const Route = ({
  id,
  route,
  vehicle,
  showDetails,
  origin,
  destination,
  isActive,
  toggleDetails,
  selectRoute,
  isMobile,
}) => {
  return (
    <Fragment>
      <div className={`itinerary_leg ${isActive ? 'itinerary_leg--active' : ''}`}>
        <RouteSummary
          id={id}
          route={route}
          isActive={isActive}
          showDetails={showDetails}
          toggleDetails={toggleDetails}
          selectRoute={selectRoute}
          vehicle={vehicle}
        />
        {!isMobile && showDetails && (
          <RoadMap route={route} origin={origin} destination={destination} vehicle={vehicle} />
        )}
      </div>
    </Fragment>
  );
};

export default Route;
