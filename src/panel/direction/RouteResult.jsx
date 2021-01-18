/* globals _ */
import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { listen, unListen } from 'src/libs/customEvents';
import Telemetry from 'src/libs/telemetry';

import RoutesList from './RoutesList';

const RouteResult = ({
  origin, destination, vehicle,
  routes = [], isLoading, error,
  activeRouteId, activeDetails,
  selectRoute, toggleDetails,
}) => {
  useEffect(() => {
    const routeSelectedOnMapHandler = listen('select_road_map', onSelectRoute);
    return () => { unListen(routeSelectedOnMapHandler); };
  }, [onSelectRoute]);

  const onSelectRoute = useCallback(routeId => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_SELECT);
    selectRoute(routeId);
  }, [selectRoute]);

  const toggleRouteDetails = () => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_TOGGLE_DETAILS);
    toggleDetails();
  };

  if (error !== 0) {
    return <div className="itinerary_no-result">
      <span className="icon-alert-triangle" />
      <div>{
        error >= 500 && error < 600
          ? _('The service is temporarily unavailable, please try again later.', 'direction')
          : _('Qwant Maps found no results for this itinerary.', 'direction')
      }</div>
      {
        vehicle === 'publicTransport' &&
        <div>{
          _(
            'We are currently testing public transport mode in a restricted set of cities.',
            'direction'
          )
        }</div>
      }
    </div>;
  }

  return <>
    <div className={classnames('itinerary_result', {
      'itinerary_result--publicTransport': vehicle === 'publicTransport',
    })}>
      <RoutesList
        isLoading={isLoading}
        routes={routes}
        activeRouteId={activeRouteId}
        origin={origin}
        destination={destination}
        vehicle={vehicle}
        activeDetails={activeDetails}
        toggleRouteDetails={toggleRouteDetails}
        selectRoute={onSelectRoute}
      />
    </div>
    {vehicle === 'publicTransport' && routes.length > 0 &&
    <div className="itinerary_source">
      <a href="https://combigo.com/">
        <img src="./statics/images/direction_icons/logo_combigo.svg" alt="" />
        Combigo
      </a>
    </div>}
  </>;
};

RouteResult.propTypes = {
  routes: PropTypes.array,
  origin: PropTypes.object,
  destination: PropTypes.object,
  vehicle: PropTypes.string,
  isLoading: PropTypes.bool,
  error: PropTypes.number,
  activeRouteId: PropTypes.number,
  selectRoute: PropTypes.func.isRequired,
  toggleDetails: PropTypes.func.isRequired,
};

export default RouteResult;
