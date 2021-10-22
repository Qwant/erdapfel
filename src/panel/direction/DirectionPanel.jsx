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

const DirectionPanel = ({ poi, urlOrigin, urlDestination }) => {
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
    if (isMobile && !urlOrigin) {
      const geolocationPermission = await getGeolocationPermission();
      let modalAccepted = false;

      // on an empty form, if the user's position permission hasn't been asked yet, show modal
      if (!urlDestination && !poi && geolocationPermission === geolocationPermissions.PROMPT) {
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
  }, [urlDestination, urlOrigin, poi, isMobile, dispatch]);

  const initialize = useCallback(() => {
    if (!isInitializing) {
      return;
    }

    // deserialize origin/destination points from url or direct passing (coming from a POI)
    async function restorePoints() {
      try {
        const poiRestorePromises = [
          urlOrigin ? poiFromUrl(urlOrigin) : null,
          urlDestination ? poiFromUrl(urlDestination) : poi ? Poi.deserialize(poi) : null,
        ];
        const [initialOrigin, initialDestination] = await Promise.all(poiRestorePromises);
        dispatch({
          type: 'setParams',
          data: { origin: initialOrigin, destination: initialDestination },
        });
      } catch (e) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${urlOrigin} / ${urlDestination}`,
          e
        );
      }

      setIsInitializing(false);
    }

    restorePoints();
  }, [urlOrigin, urlDestination, poi, isInitializing, dispatch]);

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
    dispatch({ type: 'setActiveDetails', data: !activeDetails });
    // if (this.props.isMobile) {
    //   if (this.props.details) {
    //     window.app.navigateBack({
    //       relativeUrl: 'routes/' + updateQueryString({ details: false }),
    //     });
    //   } else {
    //     this.updateUrl({ params: { details: true }, replace: false });
    //   }
    // } else {
    //   this.updateUrl({ params: { details: !this.props.details }, replace: true });
    // }
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
  urlOrigin: PropTypes.string,
  urlDestination: PropTypes.string,
  poi: PropTypes.object,
};

const DirectionPanelWrapper = ({ origin, destination, ...rest }) => {
  return <DirectionPanel urlOrigin={origin} urlDestination={destination} {...rest} />;
};

export default DirectionPanelWrapper;
