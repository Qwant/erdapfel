import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Panel, Divider, ShareMenu } from 'src/components/ui';
import { Button, IconShare } from '@qwant/qwant-ponents';
import MobileDirectionPanel from './MobileDirectionPanel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import Telemetry from 'src/libs/telemetry';
import { toUrl as poiToUrl, fromUrl as poiFromUrl } from 'src/libs/pois';
import Error from 'src/adapters/error';
import Poi from 'src/adapters/poi/poi.js';
import { fire } from 'src/libs/customEvents';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import { geolocationPermissions, getGeolocationPermission } from 'src/libs/geolocation';
import { openPendingDirectionModal } from 'src/modals/GeolocationModal';
import { updateQueryString } from 'src/libs/url_utils';
import { useDevice, useI18n } from 'src/hooks';
import { DirectionContext } from './directionStore';
import DirectionMap from './DirectionMap';

const DirectionPanel = ({ poi, urlOrigin, urlDestination }) => {
  // @TODO geoloc
  // async componentDidMount() {
  //   // on mobile, when no origin is specified, try auto-geoloc
  //   if (this.props.isMobile && !this.state.origin && !this.props.origin) {
  //     const geolocationPermission = await getGeolocationPermission();
  //     let modalAccepted = false;

  //     // on an empty form, if the user's position permission hasn't been asked yet, show modal
  //     if (
  //       !this.state.destination &&
  //       !this.props.destination &&
  //       geolocationPermission === geolocationPermissions.PROMPT
  //     ) {
  //       modalAccepted = await openPendingDirectionModal();
  //     }

  //     // If the user's position can be requested, put it in the origin field
  //     if (geolocationPermission === geolocationPermissions.GRANTED || modalAccepted) {
  //       const origin = new NavigatorGeolocalisationPoi();
  //       try {
  //         await origin.geolocate({
  //           displayErrorModal: false,
  //         });
  //         this.setState({ origin, originInputText: origin.name });
  //       } catch (e) {
  //         // ignore possible error
  //       }
  //     }
  //   }
  // }

  // componentDidUpdate(_prevProps) {
  //   // @TODO: details status in url
  //   // if (this.props.activeRouteId !== prevProps.activeRouteId && this.props.routes.length > 0) {
  //   //   this.updateUrl({ params: { details: null }, replace: true });
  //   // }
  //   // @TODO???
  //   // if (this.props.routes.length !== 0 && prevProps.routes.length === 0) {
  //   //   fire('update_map_paddings');
  //   // }
  // }

  const { state, dispatch } = useContext(DirectionContext);
  const { origin, destination, vehicle, routes, activeRouteId } = state;
  const { isMobile } = useDevice();
  const { _ } = useI18n();
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeDetails, setActiveDetails] = useState(false);

  useEffect(() => {
    Telemetry.add(Telemetry.ITINERARY_OPEN);
    initialize();

    return () => {
      dispatch({ type: 'reset' });
    };
  }, [dispatch, initialize]);

  // url side effect
  useEffect(() => {
    const search = updateQueryString({
      mode: vehicle,
      origin: origin ? poiToUrl(origin) : null,
      destination: destination ? poiToUrl(destination) : null,
      selected: activeRouteId,
      // @TODO: details,
    });
    const _relativeUrl = 'routes/' + search;

    // @TODO
    //window.app.navigateTo(relativeUrl, window.history.state, { replace: true });
  }, [origin, destination, vehicle, activeRouteId]);

  const initialize = useCallback(() => {
    if (!isInitializing) {
      return;
    }

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

  const handleShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  };

  const selectRoute = routeId => {
    dispatch({ type: 'setActiveRoute', data: routeId });
  };

  const toggleDetails = () => {
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

  const result = (
    <RouteResult
      activeDetails={activeDetails}
      toggleDetails={toggleDetails}
      selectRoute={selectRoute}
    />
  );

  return (
    <>
      <DirectionMap />
      {isMobile ? (
        <MobileDirectionPanel
          form={form}
          result={result}
          toggleDetails={toggleDetails}
          activeDetails={activeDetails}
          onClose={onClose}
          handleShareClick={this.handleShareClick}
        />
      ) : (
        <Panel className="direction-panel" onClose={onClose} renderHeader={form}>
          <div className="direction-autocomplete_suggestions" />
          {routes.length > 0 && (
            <ShareMenu url={window.location.toString()}>
              {openMenu => (
                <Button
                  className="direction-panel-share-button u-ml-auto u-flex-shrink-0 u-mr-m"
                  variant="tertiary"
                  title={_('Share itinerary', 'direction')}
                  onClick={e => handleShareClick(e, openMenu)}
                >
                  <IconShare />
                  {_('Share itinerary', 'direction')}
                </Button>
              )}
            </ShareMenu>
          )}
          <Divider paddingTop={8} paddingBottom={0} />
          {result}
        </Panel>
      )}
    </>
  );
};

const DirectionPanelWrapper = ({ origin, destination, ...rest }) => {
  return <DirectionPanel urlOrigin={origin} urlDestination={destination} {...rest} />;
};

export default DirectionPanelWrapper;
