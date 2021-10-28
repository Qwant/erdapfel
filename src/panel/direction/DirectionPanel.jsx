import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import MobileDirectionPanel from './MobileDirectionPanel';
import DesktopDirectionPanel from './DesktopDirectionPanel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import DirectionMap from './DirectionMap';
import Telemetry from 'src/libs/telemetry';
import { toUrl as poiToUrl, fromUrl as poiFromUrl } from 'src/libs/pois';
import Error from 'src/adapters/error';
import Poi from 'src/adapters/poi/poi.js';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import { geolocationPermissions, getGeolocationPermission } from 'src/libs/geolocation';
import { openPendingDirectionModal } from 'src/modals/GeolocationModal';
import { updateQueryString } from 'src/libs/url_utils';
import { useDevice } from 'src/hooks';
import { DirectionContext } from './directionStore';

const DirectionPanel = ({ poi, urlValues }) => {
  const { state, dispatch } = useContext(DirectionContext);
  const { origin, destination, vehicle, activeRouteId, activeDetails } = state;
  const { isMobile } = useDevice();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    Telemetry.add(Telemetry.ITINERARY_OPEN);
    initialize();
    autoGeoloc();

    return () => {
      dispatch({ type: 'reset' });
    };
  }, [dispatch, initialize, autoGeoloc]);

  // url side effect
  useEffect(() => {
    if (isInitializing) {
      return;
    }
    const search = updateQueryString({
      mode: vehicle,
      origin: origin ? poiToUrl(origin) : null,
      destination: destination ? poiToUrl(destination) : null,
      selected: activeRouteId,
      details: activeDetails,
    });
    const relativeUrl = 'routes/' + search;
    // @TODO: not always replace=true
    window.app.navigateTo(relativeUrl, window.history.state, { replace: true });
  }, [isInitializing, origin, destination, vehicle, activeRouteId, activeDetails]);

  const autoGeoloc = useCallback(async () => {
    // on mobile, when no origin is specified, try auto-geoloc
    if (isMobile && !urlValues.origin) {
      const geolocationPermission = await getGeolocationPermission();
      let modalAccepted = false;

      // on an empty form, if the user's position permission hasn't been asked yet, show modal
      if (
        !urlValues.destination &&
        !poi &&
        geolocationPermission === geolocationPermissions.PROMPT
      ) {
        modalAccepted = await openPendingDirectionModal();
      }

      // If the user's position can be requested, put it in the origin field
      if (geolocationPermission === geolocationPermissions.GRANTED || modalAccepted) {
        const position = new NavigatorGeolocalisationPoi();
        try {
          await position.geolocate({
            displayErrorModal: false,
          });
          dispatch({ type: 'setOrigin', data: position });
        } catch (e) {
          // ignore possible error
        }
      }
    }
  }, [urlValues.origin, urlValues.destination, poi, isMobile, dispatch]);

  const initialize = useCallback(() => {
    if (!isInitializing) {
      return;
    }

    // deserialize origin/destination points from url or direct passing (coming from a POI)
    async function restorePoints() {
      try {
        const poiRestorePromises = [
          urlValues.origin ? poiFromUrl(urlValues.origin) : null,
          urlValues.destination
            ? poiFromUrl(urlValues.destination)
            : poi
            ? Poi.deserialize(poi)
            : null,
        ];
        const [initialOrigin, initialDestination] = await Promise.all(poiRestorePromises);
        dispatch({
          type: 'setParams',
          data: {
            origin: initialOrigin,
            destination: initialDestination,
            activeRouteId: urlValues.activeRouteId || 0,
            activeDetails: urlValues.activeDetails,
          },
        });
      } catch (e) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${urlValues.origin} / ${urlValues.destination}`,
          e
        );
      }

      setIsInitializing(false);
    }

    restorePoints();
  }, [
    urlValues.origin,
    urlValues.destination,
    urlValues.activeRouteId,
    urlValues.activeDetails,
    poi,
    isInitializing,
    dispatch,
  ]);

  const onSelectVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    dispatch({ type: 'setVehicle', data: vehicle });
  };

  const onClose = () => {
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    poi
      ? window.history.back() // Go back to the poi panel
      : window.app.navigateTo('/');
  };

  const reversePoints = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    dispatch({ type: 'reversePoints' });
  };

  const onShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  };

  const selectRoute = routeId => {
    dispatch({ type: 'setActiveRoute', data: routeId });
  };

  const toggleDetails = () => {
    if (isMobile) {
      if (activeDetails) {
        window.app.navigateBack({
          relativeUrl: 'routes/' + updateQueryString({ details: false }),
        });
      } else {
        window.app.navigateTo(
          'routes/' + updateQueryString({ details: true }),
          window.history.state,
          { replace: true }
        );
      }
    } else {
      dispatch({ type: 'setActiveDetails', data: !activeDetails });
    }
  };

  const form = (
    <DirectionForm
      onReversePoints={reversePoints}
      onSelectVehicle={onSelectVehicle}
      isInitializing={isInitializing}
    />
  );

  const result = <RouteResult toggleDetails={toggleDetails} selectRoute={selectRoute} />;

  return (
    <>
      <DirectionMap />
      {isMobile ? (
        <MobileDirectionPanel
          form={form}
          result={result}
          toggleDetails={toggleDetails}
          onClose={onClose}
          onShareClick={onShareClick}
        />
      ) : (
        <DesktopDirectionPanel
          form={form}
          result={result}
          onClose={onClose}
          onShareClick={onShareClick}
        />
      )}
    </>
  );
};

DirectionPanel.propTypes = {
  poi: PropTypes.object,
  urlValues: PropTypes.object,
};

const DirectionPanelWrapper = ({ origin, destination, activeDetails, activeRouteId, ...rest }) => {
  return (
    <DirectionPanel urlValues={{ origin, destination, activeDetails, activeRouteId }} {...rest} />
  );
};

export default DirectionPanelWrapper;
