/* globals _ */
import React, { useContext, useEffect } from 'react';
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
import { useDevice } from 'src/hooks';
import { DirectionContext } from './directionStore';
import DirectionMap from './DirectionMap';

class DirectionPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.string,
    destination: PropTypes.string,
    poi: PropTypes.object,
    mode: PropTypes.string,
    details: PropTypes.bool,
    isMobile: PropTypes.bool,

    routes: PropTypes.array,
    activeRouteId: PropTypes.number,
    error: PropTypes.number,
    isLoading: PropTypes.bool,
    dispatch: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      origin: null,
      destination: (props.poi && Poi.deserialize(props.poi)) || null,
      isInitializing: true,
    };

    this.restorePoints(props);
  }

  async componentDidMount() {
    // on mobile, when no origin is specified, try auto-geoloc
    if (this.props.isMobile && !this.state.origin && !this.props.origin) {
      const geolocationPermission = await getGeolocationPermission();
      let modalAccepted = false;

      // on an empty form, if the user's position permission hasn't been asked yet, show modal
      if (
        !this.state.destination &&
        !this.props.destination &&
        geolocationPermission === geolocationPermissions.PROMPT
      ) {
        modalAccepted = await openPendingDirectionModal();
      }

      // If the user's position can be requested, put it in the origin field
      if (geolocationPermission === geolocationPermissions.GRANTED || modalAccepted) {
        const origin = new NavigatorGeolocalisationPoi();
        try {
          await origin.geolocate({
            displayErrorModal: false,
          });
          this.setState({ origin, originInputText: origin.name });
        } catch (e) {
          // ignore possible error
        }
      }
    }
  }

  componentDidUpdate(_prevProps) {
    // @TODO: details status in url
    // if (this.props.activeRouteId !== prevProps.activeRouteId && this.props.routes.length > 0) {
    //   this.updateUrl({ params: { details: null }, replace: true });
    // }
    // @TODO???
    // if (this.props.routes.length !== 0 && prevProps.routes.length === 0) {
    //   fire('update_map_paddings');
    // }
  }

  async restorePoints({ origin: originUrlValue, destination: destinationUrlValue }) {
    const poiRestorePromises = [
      originUrlValue ? poiFromUrl(originUrlValue) : this.state.origin,
      destinationUrlValue ? poiFromUrl(destinationUrlValue) : this.state.destination,
    ];

    try {
      const [origin, destination] = await Promise.all(poiRestorePromises);
      // Set markers
      if (origin) {
        window.execOnMapLoaded(() => {
          fire('set_origin', origin);
          if (!destination) {
            fire('fit_map', origin);
          }
        });
        this.props.dispatch({ type: 'setOrigin', data: origin });
      }

      if (destination) {
        window.execOnMapLoaded(() => {
          fire('set_destination', destination);
          if (!origin) {
            fire('fit_map', destination);
          }
        });
        this.props.dispatch({ type: 'setDestination', data: destination });
      }

      this.setState({ isInitializing: false });
    } catch (e) {
      Error.sendOnce(
        'direction_panel',
        'restoreUrl',
        `Error restoring Poi from Url ${originUrlValue} / ${destinationUrlValue}`,
        e
      );
    }
  }

  onSelectVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.props.dispatch({ type: 'setVehicle', data: vehicle });
  };

  onClose = () => {
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    this.props.poi
      ? window.history.back() // Go back to the poi panel
      : window.app.navigateTo('/');
  };

  reversePoints = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    this.props.dispatch({ type: 'reversePoints' });
  };

  changeDirectionPoint = (which, point) => {
    this.props.dispatch({ type: which === 'origin' ? 'setOrigin' : 'setDestination', data: point });
  };

  handleShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  };

  selectRoute = routeId => {
    this.props.dispatch({ type: 'setActiveRoute', data: routeId });
  };

  toggleDetails = () => {
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

  render() {
    const { isInitializing } = this.state;
    const { details: activeDetails, isMobile, routes } = this.props;

    const form = (
      <DirectionForm
        onChangeDirectionPoint={this.changeDirectionPoint}
        onReversePoints={this.reversePoints}
        onSelectVehicle={this.onSelectVehicle}
        isInitializing={isInitializing}
      />
    );

    const result = (
      <RouteResult
        activeDetails={activeDetails}
        toggleDetails={this.toggleDetails}
        selectRoute={this.selectRoute}
      />
    );

    return isMobile ? (
      <MobileDirectionPanel
        form={form}
        result={result}
        toggleDetails={this.toggleDetails}
        activeDetails={activeDetails}
        onClose={this.onClose}
        handleShareClick={this.handleShareClick}
      />
    ) : (
      <Panel className="direction-panel" onClose={this.onClose} renderHeader={form}>
        <div className="direction-autocomplete_suggestions" />
        {routes.length > 0 && (
          <ShareMenu url={window.location.toString()}>
            {openMenu => (
              <Button
                className="direction-panel-share-button u-ml-auto u-flex-shrink-0 u-mr-m"
                variant="tertiary"
                title={_('Share itinerary', 'direction')}
                onClick={e => this.handleShareClick(e, openMenu)}
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
    );
  }
}

const DirectionPanelFunc = props => {
  const { isMobile } = useDevice();
  const { state, dispatch } = useContext(DirectionContext);
  const { origin, destination, vehicle, routes, activeRouteId, isLoading, error } = state;

  useEffect(() => {
    Telemetry.add(Telemetry.ITINERARY_OPEN);

    return () => {
      dispatch({ type: 'reset' });
    };
  }, [dispatch]);

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

  return (
    <>
      <DirectionPanel
        isMobile={isMobile}
        {...props}
        vehicle={vehicle}
        routes={routes}
        activeRouteId={activeRouteId}
        error={error}
        isLoading={isLoading}
        dispatch={dispatch}
      />
      <DirectionMap />
    </>
  );
};

export default DirectionPanelFunc;
