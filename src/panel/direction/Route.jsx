import React, { useContext, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import MobileRouteDetails from './MobileRouteDetails';
import RouteSummary from './RouteSummary';
import RoadMap from './RoadMap';
import { DeviceContext } from 'src/libs/device';

const Route = ({
  id, route, vehicle, showDetails, origin, destination, isActive,
  toggleDetails, openPreview, selectRoute,
}) => {
  const isMobile = useContext(DeviceContext);
  const portalContainer = document.createElement('div');

  useEffect(() => {
    if (showDetails && isMobile) {
      document.body.appendChild(portalContainer);
    }
    return function removePortalContainer() {
      portalContainer.remove();
    };
  }, [isMobile, showDetails, portalContainer]);

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
    {isMobile && showDetails && ReactDOM.createPortal(<MobileRouteDetails
      id={id}
      route={route}
      origin={origin}
      destination={destination}
      vehicle={vehicle}
      toggleDetails={toggleDetails}
      openPreview={openPreview}
    />, portalContainer)}
  </Fragment>;
};

export default Route;
