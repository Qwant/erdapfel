/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Divider, ShareMenu } from 'src/components/ui';
import { Button, IconShare } from '@qwant/qwant-ponents';
import MobileDirectionPanel from './MobileDirectionPanel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import DirectionApi, { modes } from 'src/adapters/direction_api';
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
import { usePageTitle, useDevice } from 'src/hooks';

class DirectionPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.string,
    destination: PropTypes.string,
    poi: PropTypes.object,
    mode: PropTypes.string,
    isPublicTransportActive: PropTypes.bool,
    activeRouteId: PropTypes.number,
    details: PropTypes.bool,
    isMobile: PropTypes.bool,
  };

  static defaultProps = {
    activeRouteId: 0,
  };

  constructor(props) {
    super(props);

    this.directionPanelRef = React.createRef();
    this.vehicles = [modes.DRIVING, modes.WALKING, modes.CYCLING];
    if (this.props.isPublicTransportActive) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }

    const activeVehicle = this.vehicles.indexOf(props.mode) !== -1 ? props.mode : modes.DRIVING;

    this.lastQueryId = 0;

    this.state = {
      vehicle: activeVehicle,
      origin: null,
      destination: (props.poi && Poi.deserialize(props.poi)) || null,
      isLoading: false,
      isDirty: true, // useful to track intermediary states, when API update call is not made yet
      error: 0,
      routes: [],
      isInitializing: true,
      originInputText: '',
      destinationInputText: '',
    };

    this.restorePoints(props);
  }

  async componentDidMount() {
    Telemetry.add(Telemetry.ITINERARY_OPEN);
    document.body.classList.add('directions-open');
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
          this.setState({ origin, originInputText: origin.name }, this.update);
        } catch (e) {
          // ignore possible error
        }
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.activeRouteId !== prevProps.activeRouteId && this.state.routes.length > 0) {
      fire('set_main_route', { routeId: this.props.activeRouteId, fitView: true });
      this.updateUrl({ params: { details: null }, replace: true });
    }

    if (this.state.routes.length !== 0 && prevState.routes.length === 0) {
      fire('update_map_paddings');
    }
  }

  componentWillUnmount() {
    fire('clean_routes');
    unListen(this.dragPointHandler);
    unListen(this.setPointHandler);
    document.body.classList.remove('directions-open');
    fire('update_map_paddings');
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
        this.setTextInput('origin', origin);
      }

      if (destination) {
        window.execOnMapLoaded(() => {
          fire('set_destination', destination);
          if (!origin) {
            fire('fit_map', destination);
          }
        });
        this.setTextInput('destination', destination);
      }

      this.setState(
        {
          origin,
          destination,
          isInitializing: false,
        },
        this.update
      );
    } catch (e) {
      Error.sendOnce(
        'direction_panel',
        'restoreUrl',
        `Error restoring Poi from Url ${originUrlValue} / ${destinationUrlValue}`,
        e
      );
    }
  }

  computeRoutes = async () => {
    const { origin, destination, vehicle } = this.state;
    if (origin && destination) {
      this.setState({
        isDirty: false,
        isLoading: true,
        error: 0,
        routes: [],
      });
      const currentQueryId = ++this.lastQueryId;
      fire('set_origin', origin);
      fire('set_destination', destination);
      const directionResponse = await DirectionApi.search(origin, destination, vehicle);
      // A more recent query was done in the meantime, ignore this result silently
      if (currentQueryId !== this.lastQueryId) {
        return;
      }
      if (directionResponse && directionResponse.error === 0) {
        // Valid, non-empty response
        const routes = directionResponse.data.routes
          .sort((routeA, routeB) => routeA.duration - routeB.duration)
          .map((route, i) => ({ ...route, id: i }));

        this.setState({ isLoading: false, error: 0, routes }, () => {
          const activeRouteId =
            this.props.activeRouteId < this.state.routes.length ? this.props.activeRouteId : 0;
          window.execOnMapLoaded(() => {
            fire('set_routes', { routes, vehicle, activeRouteId });
          });
          this.updateUrl({ params: { selected: activeRouteId }, replace: true });
        });
      } else {
        // Error or empty response
        this.setState({ isLoading: false, error: directionResponse.error });
        fire('clean_routes');
      }
    } else {
      // When both fields are not filled yet or not filled anymore
      this.setState({ isLoading: false, isDirty: false, error: 0, routes: [] });
      fire('clean_routes');
      if (origin) {
        fire('set_origin', origin);
      } else if (destination) {
        fire('set_destination', destination);
      }
    }
  };

  updateUrl({ params = {}, replace = false } = {}) {
    const search = updateQueryString({
      mode: this.state.vehicle,
      origin: this.state.origin ? poiToUrl(this.state.origin) : null,
      destination: this.state.destination ? poiToUrl(this.state.destination) : null,
      pt: this.props.isPublicTransportActive ? 'true' : null,
      ...params,
    });
    const relativeUrl = 'routes/' + search;

    window.app.navigateTo(relativeUrl, window.history.state, { replace });
  }

  update() {
    this.updateUrl({ replace: true });
    this.computeRoutes();
  }

  onSelectVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.setState({ vehicle, isDirty: true }, this.update);
  };

  onClose = () => {
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    this.props.poi
      ? window.history.back() // Go back to the poi panel
      : window.app.navigateTo('/');
  };

  reversePoints = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    this.setState(
      previousState => ({
        origin: previousState.destination,
        destination: previousState.origin,
        originInputText: previousState.destinationInputText,
        destinationInputText: previousState.originInputText,
        isDirty: true,
      }),
      this.update
    );
  };

  changeDirectionPoint = (which, value, point) => {
    this.setState(
      {
        [which]: point,
        isDirty: true,
        [which + 'InputText']: value || '',
      },
      () => {
        this.update();
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

    // Update state
    // (Call update() that will perform a search and redraw the UI if both fields are set)
    this.setState(
      {
        [which]: poi,
        isDirty: true,
      },
      this.update
    );
  };

  handleShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  };

  selectRoute = routeId => {
    this.updateUrl({ params: { selected: routeId }, replace: true });
  };

  toggleDetails = () => {
    if (this.props.isMobile) {
      if (this.props.details) {
        window.app.navigateBack({
          relativeUrl: 'routes/' + updateQueryString({ details: false }),
        });
      } else {
        this.updateUrl({ params: { details: true }, replace: false });
      }
    } else {
      this.updateUrl({ params: { details: !this.props.details }, replace: true });
    }
  };

  render() {
    const {
      origin,
      destination,
      vehicle,
      routes,
      error,
      isLoading,
      isDirty,
      isInitializing,
      originInputText,
      destinationInputText,
    } = this.state;

    const { activeRouteId, details: activeDetails, isMobile } = this.props;

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
        isLoading={isLoading || (routes.length > 0 && isDirty)}
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
  usePageTitle(_('Directions'));
  const { isMobile } = useDevice();
  return <DirectionPanel isMobile={isMobile} {...props} />;
};

export default DirectionPanelFunc;
