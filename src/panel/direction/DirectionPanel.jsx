/* globals _ */
import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Panel, Divider, ShareMenu } from 'src/components/ui';
import { Button, IconShare } from '@qwant/qwant-ponents';
import MobileDirectionPanel from './MobileDirectionPanel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import { modes } from 'src/adapters/direction_api';
import Telemetry from 'src/libs/telemetry';
import { toUrl as poiToUrl, fromUrl as poiFromUrl } from 'src/libs/pois';
import Error from 'src/adapters/error';
import Poi from 'src/adapters/poi/poi.js';
import { fire, listen, unListen } from 'src/libs/customEvents';
import * as address from 'src/libs/address';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import { getInputValue } from 'src/libs/suggest';
import { geolocationPermissions, getGeolocationPermission } from 'src/libs/geolocation';
import { openPendingDirectionModal } from 'src/modals/GeolocationModal';
import { updateQueryString } from 'src/libs/url_utils';
import { isNullOrEmpty } from 'src/libs/object';
import { useDevice } from 'src/hooks';
import { DirectionContext } from './directionStore';

class DirectionPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.string,
    destination: PropTypes.string,
    poi: PropTypes.object,
    mode: PropTypes.string,
    isPublicTransportActive: PropTypes.bool,
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

    this.vehicles = [modes.DRIVING, modes.WALKING, modes.CYCLING];
    if (this.props.isPublicTransportActive) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }

    // @TODO
    // const activeVehicle = this.vehicles.indexOf(props.mode) !== -1 ? props.mode : modes.DRIVING;

    this.state = {
      origin: null,
      destination: (props.poi && Poi.deserialize(props.poi)) || null,
      isInitializing: true,
      originInputText: '',
      destinationInputText: '',
    };

    this.restorePoints(props);
  }

  async componentDidMount() {
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
    this.setPointHandler = listen('set_direction_point', this.setDirectionPoint);

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

  componentDidUpdate(prevProps) {
    // @TODO: details status in url
    // if (this.props.activeRouteId !== prevProps.activeRouteId && this.props.routes.length > 0) {
    //   this.updateUrl({ params: { details: null }, replace: true });
    // }

    if (this.props.routes.length !== 0 && prevProps.routes.length === 0) {
      fire('update_map_paddings');
    }
  }

  componentWillUnmount() {
    unListen(this.dragPointHandler);
    unListen(this.setPointHandler);
  }

  async setTextInput(which, poi) {
    if (isNullOrEmpty(poi.address)) {
      // fetch missing address
      poi.address = await address.fetch(poi);
    }
    this.setState({ [which + 'InputText']: getInputValue(poi) });
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
        this.setTextInput('origin', origin);
      }

      if (destination) {
        window.execOnMapLoaded(() => {
          fire('set_destination', destination);
          if (!origin) {
            fire('fit_map', destination);
          }
        });
        this.props.dispatch({ type: 'setDestination', data: destination });
        this.setTextInput('destination', destination);
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
    // @TODO
    this.setState(previousState => ({
      originInputText: previousState.destinationInputText,
      destinationInputText: previousState.originInputText,
    }));
  };

  changeDirectionPoint = (which, value, point) => {
    this.props.dispatch({ type: which === 'origin' ? 'setOrigin' : 'setDestination', data: point });

    this.setState(
      {
        [which + 'InputText']: value || '',
      },
      () => {
        // Retrieve addresses
        if (point && point.type === 'latlon') {
          this.setTextInput(which, this.state[which]);
        }
      }
    );
  };

  setDirectionPoint = poi => {
    if (this.state.origin && this.state.destination) {
      return;
    }
    const which = this.state.origin ? 'destination' : 'origin';
    this.setTextInput(which, poi);

    this.props.dispatch({ type: which === 'origin' ? 'setOrigin' : 'setDestination', data: poi });
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
    const {
      origin,
      destination,
      isInitializing,
      originInputText,
      destinationInputText,
    } = this.state;

    const {
      activeRouteId,
      details: activeDetails,
      isMobile,
      routes,
      isLoading,
      error,
      vehicle,
    } = this.props;

    const form = (
      <DirectionForm
        isLoading={isLoading}
        origin={origin}
        destination={destination}
        originInputText={originInputText}
        destinationInputText={destinationInputText}
        onChangeDirectionPoint={this.changeDirectionPoint}
        onReversePoints={this.reversePoints}
        onEmptyOrigin={this.emptyOrigin}
        onEmptyDestination={this.emptyDestination}
        vehicles={this.vehicles}
        onSelectVehicle={this.onSelectVehicle}
        activeVehicle={vehicle}
        isInitializing={isInitializing}
      />
    );

    const result = (
      <RouteResult
        activeRouteId={activeRouteId}
        activeDetails={activeDetails}
        isLoading={isLoading}
        vehicle={vehicle}
        error={error}
        routes={routes}
        origin={origin}
        destination={destination}
        toggleDetails={this.toggleDetails}
        selectRoute={this.selectRoute}
      />
    );

    return isMobile ? (
      <MobileDirectionPanel
        form={form}
        result={result}
        routes={routes}
        origin={origin}
        destination={destination}
        vehicle={vehicle}
        toggleDetails={this.toggleDetails}
        activeDetails={activeDetails}
        activeRouteId={activeRouteId}
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
      fire('clean_routes');
      fire('update_map_paddings');
    };
  }, [dispatch]);

  // map side effects
  useEffect(() => {
    // @TODO: on map ready
    fire('set_routes', {
      routes,
      vehicle,
      activeRouteId,
    });
  }, [routes /* Omit active route ID and vehicle on purpose */]);

  useEffect(() => {
    fire('set_main_route', { routeId: activeRouteId, fitView: true });
  }, [activeRouteId]);

  // url side effect
  useEffect(() => {
    const search = updateQueryString({
      mode: vehicle,
      origin: origin ? poiToUrl(origin) : null,
      destination: destination ? poiToUrl(destination) : null,
      selected: activeRouteId,
      // @TODO: details,
    });
    const relativeUrl = 'routes/' + search;

    console.log(relativeUrl);

    // @TODO
    //window.app.navigateTo(relativeUrl, window.history.state, { replace: true });
  }, [origin, destination, vehicle, activeRouteId]);

  return (
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
  );
};

export default DirectionPanelFunc;
