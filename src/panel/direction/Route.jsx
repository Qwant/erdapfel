import React, { useContext, Fragment } from 'react';
import MobileRouteDetails from './MobileRouteDetails';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';
import { DeviceContext } from 'src/libs/device';

const Route = ({
  id, route, vehicle, showDetails, origin, destination, isActive,
  toggleDetails, openPreview, selectRoute, hoverRoute,
}) => {
  const isMobile = useContext(DeviceContext);

  return <Fragment>
    <div className={`itinerary_leg ${isActive ? 'itinerary_leg--active' : ''}`}
      onMouseEnter={() => { hoverRoute(id, true); }}
      onMouseLeave={() => { hoverRoute(id, false); }}
    >
      <RouteSummary id={id} route={route}
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
    {isMobile && showDetails && <MobileRouteDetails
      id={id}
      route={route}
      origin={origin}
      destination={destination}
      vehicle={vehicle}
      toggleDetails={toggleDetails}
      openPreview={openPreview}
    />}
  </Fragment>;
};

export default Route;
