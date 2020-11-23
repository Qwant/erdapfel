import React, { useContext, Fragment } from 'react';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';
import { DeviceContext } from 'src/libs/device';

const Route = ({
  id, route, vehicle, showDetails, origin, destination, isActive,
  toggleDetails, openPreview, selectRoute,
}) => {
  const isMobile = useContext(DeviceContext);

  return <Fragment>
    <div className={`itinerary_leg ${isActive ? 'itinerary_leg--active' : ''}`}>
      <RouteSummary
        id={id}
        route={route}
        isActive={isActive}
        showDetails={showDetails}
        toggleDetails={toggleDetails}
        openPreview={openPreview}
        selectRoute={selectRoute}
        vehicle={vehicle}
      />
      {!isMobile && showDetails && <RoadMap
        route={route}
        origin={origin}
        destination={destination}
        vehicle={vehicle} />}
    </div>
  </Fragment>;
};

export default Route;
