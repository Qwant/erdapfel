/* globals _ */
import React, { useCallback, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { listen, unListen } from 'src/libs/customEvents';
import Telemetry from 'src/libs/telemetry';
import RoutesList from '../RoutesList';
import { SourceFooter, UserFeedbackYesNo } from 'src/components/ui';
import { useDevice } from 'src/hooks';
import { PanelContext } from 'src/libs/panelContext';

const RouteResult = ({
  origin,
  destination,
  vehicle,
  routes = [],
  isLoading,
  error,
  activeRouteId,
  activeDetails,
  selectRoute,
  toggleDetails,
}) => {
  const { isMobile } = useDevice();
  const { size: panelSize } = useContext(PanelContext);

  useEffect(() => {
    const routeSelectedOnMapHandler = listen('select_road_map', onSelectRoute);
    return () => {
      unListen(routeSelectedOnMapHandler);
    };
  }, [onSelectRoute]);

  const onSelectRoute = useCallback(
    routeId => {
      Telemetry.add(Telemetry.ITINERARY_ROUTE_SELECT);
      selectRoute(routeId);
    },
    [selectRoute]
  );

  const toggleRouteDetails = () => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_TOGGLE_DETAILS);
    toggleDetails();
  };

  if (error !== 0) {
    return (
      <div className="itinerary_no-result">
        <p
          className="u-mb-xs u-text--smallTitle u-center"
          dangerouslySetInnerHTML={{ __html: _("Ouch, we've lost the north&nbsp;🧭") }}
        />
        <p className="u-text--subtitle u-mb-l u-center">
          {error >= 500 && error < 600
            ? _('The service is temporarily unavailable, please try again later.', 'direction')
            : _("We couldn't find any itinerary, we are really sorry.", 'direction')}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={`itinerary_result itinerary_result--${vehicle}`}>
        <RoutesList
          isMobile={isMobile}
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
      {routes.length > 0 && (!isMobile || panelSize === 'maximized') && (
        <UserFeedbackYesNo
          questionId="routes"
          context={document.location.href}
          question={_('Satisfied with the results?')}
        />
      )}
      {vehicle === 'publicTransport' && routes.length > 0 && (
        <SourceFooter>
          <a href="https://combigo.com/">{_('Results in partnership with Combigo')}</a>
        </SourceFooter>
      )}
    </>
  );
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
