import React from 'react';
import { useDevice } from 'src/hooks';
import { Item, ItemList } from 'src/components/ui/ItemList';
import { Stack, Ghost } from '@qwant/qwant-ponents';
import Route from './Route';

const RoutesList = ({
  routes,
  activeRouteId,
  activeDetails,
  origin,
  destination,
  vehicle,
  toggleRouteDetails,
  selectRoute,
  isLoading,
}) => {
  const { isMobile } = useDevice();
  const orderedRoutes = isMobile ? moveRouteToTop(routes, activeRouteId) : routes;

  return isLoading ? (
    <Placeholder />
  ) : (
    <ItemList>
      {orderedRoutes.map(route => (
        <Item key={route.id}>
          <Route
            id={route.id}
            route={route}
            origin={origin}
            destination={destination}
            vehicle={vehicle}
            isActive={route.id === activeRouteId}
            showDetails={route.id === activeRouteId && activeDetails}
            toggleDetails={toggleRouteDetails}
            selectRoute={selectRoute}
          />
        </Item>
      ))}
    </ItemList>
  );
};

const Placeholder = () => {
  return (
    <ItemList>
      <Item>
        <div className="itinerary_leg itinerary_leg--placeholder">
          <Stack gap="xxs" className="itinerary_leg_summary">
            <Ghost width="20%" height={24} />
            <Ghost width="35%" height={18} />
            <Ghost width="50%" height={18} />
          </Stack>
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
    .sort((a, b) => (a.id === id ? -1 : b.id === id ? 1 : 0));
};

export default RoutesList;
