/* globals _ */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'src/components/ui';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import DirectionApi, { modes } from 'src/adapters/direction_api';
import Telemetry from 'src/libs/telemetry';
import { toUrl as poiToUrl, fromUrl as poiFromUrl } from 'src/libs/pois';
import { DeviceContext } from 'src/libs/device';
import Error from 'src/adapters/error';
import Poi from 'src/adapters/poi/poi.js';
import { getAllSteps } from 'src/libs/route_utils';
import MobileRoadMapPreview from './MobileRoadMapPreview';
import { fire, listen, unListen } from 'src/libs/customEvents';
import * as address from 'src/libs/address';
import { Button, CloseButton, Divider, Flex, FloatingButton } from 'src/components/ui';
import { isMobileDevice } from 'src/libs/device';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import { PanelContext } from 'src/libs/panelContext.js';
import { getInputValue } from 'src/libs/suggest';
import { geolocationPermissions, getGeolocationPermission } from 'src/libs/geolocation';
import { openPendingDirectionModal } from 'src/modals/GeolocationModal';
import ShareMenu from 'src/components/ui/ShareMenu';
import { updateQueryString } from 'src/libs/url_utils';
import MobileRouteDetails from './MobileRouteDetails';
import { isNullOrEmpty } from 'src/libs/object';
import { usePageTitle } from 'src/hooks';

const MARGIN_TOP_OFFSET = 64; // reserve space to display map

class DirectionPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.string,
    destination: PropTypes.string,
    poi: PropTypes.object,
    mode: PropTypes.string,
    isPublicTransportActive: PropTypes.bool,
    activeRouteId: PropTypes.number,
    details: PropTypes.bool,
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
      activePreviewRoute: null,
      isInitializing: true,
      originInputText: '',
      destinationInputText: '',
      marginTop: 0,
    };

    this.restorePoints(props);
  }

  async componentDidMount() {
    Telemetry.add(Telemetry.ITINERARY_OPEN);
    document.body.classList.add('directions-open');
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
    this.setPointHandler = listen('set_direction_point', this.setDirectionPoint);

    // on mobile, when no origin is specified, try auto-geoloc
    if (isMobileDevice() && !this.state.origin && !this.props.origin) {
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
    const marginTop = this.directionPanelRef.current
      ? this.directionPanelRef.current.offsetHeight + MARGIN_TOP_OFFSET
      : 0;

    if (marginTop !== this.state.marginTop) {
      this.setState({
        marginTop,
      });
    }

    if (this.props.activeRouteId !== prevProps.activeRouteId && this.state.routes.length > 0) {
      fire('set_main_route', { routeId: this.props.activeRouteId, fitView: true });
      this.updateUrl({ params: { details: null }, replace: true });
      this.setState({ activePreviewRoute: null });
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
    this.context.setSize('default');
  }

  onSelectVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.setState({ vehicle, isDirty: true }, this.update);
  };

  onClose = () => {
    if (this.state.activePreviewRoute) {
      this.setState({ activePreviewRoute: null });
    } else {
      Telemetry.add(Telemetry.ITINERARY_CLOSE);
      this.props.poi
        ? window.history.back() // Go back to the poi panel
        : window.app.navigateTo('/');
    }
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
        activePreviewRoute: null,
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

  openMobilePreview = route => {
    Telemetry.add(Telemetry.ITINERARY_ROUTE_PREVIEW_OPEN);
    this.setState({ activePreviewRoute: route });
  };

  handleShareClick = (e, handler) => {
    Telemetry.add(Telemetry.ITINERARY_SHARE);
    return handler(e);
  };

  selectRoute = routeId => {
    this.updateUrl({ params: { selected: routeId }, replace: true });
  };

  toggleDetails() {
    if (isMobileDevice()) {
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
  }

  render() {
    const {
      origin,
      destination,
      vehicle,
      routes,
      error,
      activePreviewRoute,
      isLoading,
      isDirty,
      isInitializing,
      originInputText,
      destinationInputText,
      marginTop,
    } = this.state;

    const { activeRouteId, details: activeDetails } = this.props;

    const title = (
      <h3 className="direction-title u-text--title u-firstCap">
        {_('calculate an itinerary', 'direction')}
      </h3>
    );
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
        toggleDetails={() => this.toggleDetails()}
        selectRoute={this.selectRoute}
      />
    );

    const isFormCompleted = origin && destination;
    const isResultDisplayed = !activePreviewRoute && isFormCompleted;

    return (
      <DeviceContext.Consumer>
        {({ isMobile }) =>
          isMobile ? (
            <Fragment>
              {!activePreviewRoute && (
                <div className="direction-panel" ref={this.directionPanelRef}>
                  {!isFormCompleted && (
                    <Flex
                      className="direction-panel-header"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      {title}
                      <CloseButton onClick={this.onClose} />
                    </Flex>
                  )}
                  {form}
                  <div
                    id="direction-autocomplete_suggestions"
                    className="direction-autocomplete_suggestions"
                  />
                </div>
              )}
              {isResultDisplayed && (
                <Panel
                  className="direction-panel-mobile"
                  resizable
                  fitContent={['default', 'maximized']}
                  marginTop={marginTop}
                  minimizedTitle={_('Unfold to show the results', 'direction')}
                  onClose={this.onClose}
                  isMapBottomUIDisplayed={false}
                  floatingItemsRight={[
                    <ShareMenu key="action-share" url={window.location.toString()}>
                      {openMenu => (
                        <FloatingButton
                          title={_('Share itinerary', 'direction')}
                          onClick={e => this.handleShareClick(e, openMenu)}
                          icon="share-2"
                        />
                      )}
                    </ShareMenu>,
                  ]}
                  onTransitionEnd={(prevSize, size) => {
                    if (prevSize === 'maximized' && size === 'default' && activeRouteId >= 0) {
                      fire('set_main_route', { routeId: activeRouteId, fitView: true });
                    }
                  }}
                >
                  {result}
                </Panel>
              )}

              {activePreviewRoute && (
                <MobileRoadMapPreview
                  steps={getAllSteps(activePreviewRoute)}
                  onClose={this.onClose}
                />
              )}

              {!activePreviewRoute &&
                isMobile &&
                activeDetails &&
                activeRouteId >= 0 &&
                this.state.routes.length > 0 && (
                  <MobileRouteDetails
                    id={activeRouteId}
                    route={routes[activeRouteId]}
                    origin={origin}
                    destination={destination}
                    vehicle={vehicle}
                    toggleDetails={() => this.toggleDetails()}
                    openPreview={() => this.openMobilePreview(routes[activeRouteId])}
                  />
                )}
            </Fragment>
          ) : (
            <Panel className="direction-panel" onClose={this.onClose} renderHeader={form}>
              <div id="direction-autocomplete_suggestions" />
              {isResultDisplayed && (
                <ShareMenu url={window.location.toString()}>
                  {openMenu => (
                    <Button
                      className="direction-panel-share-button u-ml-auto u-flex-shrink-0 u-mr-m"
                      variant="tertiary"
                      title={_('Share itinerary', 'direction')}
                      onClick={e => this.handleShareClick(e, openMenu)}
                      icon="share-2"
                    >
                      {_('Share itinerary', 'direction')}
                    </Button>
                  )}
                </ShareMenu>
              )}
              <Divider paddingTop={8} paddingBottom={0} />
              {result}
            </Panel>
          )
        }
      </DeviceContext.Consumer>
    );
  }
}

DirectionPanel.contextType = PanelContext;

const DirectionPanelFunc = ({ props }) => {
  usePageTitle(_('Directions'));
  return <DirectionPanel {...props} />;
};

export default DirectionPanelFunc;
