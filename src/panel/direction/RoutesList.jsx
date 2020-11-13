import React, { useContext } from 'react';

import { DeviceContext } from 'src/libs/device';
import { Item, ItemList } from 'src/components/ui/ItemList';
import PlaceholderText from 'src/components/ui/PlaceholderText';
import Route from './Route';

const RoutesList = ({
  routes,
  activeRouteId,
  activeDetails,
  origin,
  destination,
  vehicle,
  toggleRouteDetails,
  openPreview,
  selectRoute,
  isLoading,
}) => {

  const isMobile = useContext(DeviceContext);
  const orderedRoutes = isMobile
    ? moveRouteToTop(routes, activeRouteId)
    : routes;

  return isLoading
    ? <Placeholder />
    : <ItemList>
      {orderedRoutes.map(route =>
        <Item
          key={route.id}>
          <Route
            id={route.id}
            route={route}
            origin={origin}
            destination={destination}
            vehicle={vehicle}
            isActive={route.id === activeRouteId}
            showDetails={route.id === activeRouteId && activeDetails}
            toggleDetails={toggleRouteDetails}
            openPreview={openPreview}
            selectRoute={selectRoute}
          />
        </Item>
      )}
    </ItemList>;
};

const Placeholder = () => {
  return (
    <ItemList>
      <Item>
        <div className="itinerary_leg itinerary_leg--placeholder">
          <div className="itinerary_leg_summary">
            <div className="itinerary_leg_via">
              <div className="routeVia">
                <PlaceholderText length={17} />
              </div>
              <PlaceholderText length={10} />
            </div>
            <div>
              <PlaceholderText length={5} />
              <PlaceholderText length={7} />
            </div>
          </div>
        </div>
      </Item>
    </ItemList>
  );
};

const moveRouteToTop = (routes, id) => {
  if (!id) {
    return routes;
  }

  return routes
    .slice() // clone the array as sort operates on-place
    .sort((a, b) => a.id === id
      ? -1
      : b.id === id ? 1 : 0
    );
};

export default RoutesList;
