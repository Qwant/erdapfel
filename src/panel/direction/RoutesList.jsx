import React from 'react';

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

  return isLoading
    ? <Placeholder />
    : <ItemList>
      {routes.map(route =>
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

export default RoutesList;
