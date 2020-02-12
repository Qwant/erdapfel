/* globals _ */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import DirectionApi, { modes } from 'src/adapters/direction_api';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import { toUrl as poiToUrl, fromUrl as poiFromUrl } from 'src/libs/pois';
import { DeviceContext } from 'src/libs/device';
import Error from 'src/adapters/error';
import Poi from 'src/adapters/poi/poi.js';
import { getAllSteps } from 'src/libs/route_utils';
import MobileRoadMapPreview from './MobileRoadMapPreview';

// this outside state is used to restore origin/destination when returning to the panel after closing
const persistentPointState = {
  origin: null,
  destination: null,
};

export default class DirectionPanel extends React.Component {
  static propTypes = {
    origin: PropTypes.string,
    destination: PropTypes.string,
    poi: PropTypes.object,
    mode: PropTypes.string,
  }

  constructor(props) {
    super(props);

    Telemetry.add(Telemetry.ITINERARY_OPEN, null, null,
      props.poi && Telemetry.buildInteractionData({
        id: props.poi.id,
        source: props.poi.meta ? props.poi.meta.source : props.poi.name,
        template: 'simple',
        zone: 'detail',
        element: 'itinerary',
      })
    );

    this.vehicles = [modes.DRIVING, modes.WALKING, modes.CYCLING];
    if (nconf.get().direction.publicTransport.enabled) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }

    const activeVehicle = this.vehicles.indexOf(props.mode) !== -1
      ? props.mode : modes.DRIVING;

    this.state = {
      vehicle: activeVehicle,
      origin: persistentPointState.origin || null,
      destination:
        (props.poi && Poi.deserialize(props.poi)) || persistentPointState.destination || null,
      isLoading: false,
      isDirty: true, // useful to track intermediary states, when API update call is not made yet
      error: 0,
      routes: [],
      activePreviewRoute: null,
      isInitializing: true,
    };

    this.restorePoints(props);
  }

  componentDidMount() {
    document.body.classList.add('directions-open');
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
    this.setPointHandler = listen('set_direction_point', this.setDirectionPoint);
  }

  componentWillUnmount() {
    fire('clean_route');
    window.unListen(this.dragPointHandler);
    window.unListen(this.setPointHandler);
    document.body.classList.remove('directions-open');
  }

  restorePoints({ origin: originUrlValue, destination: destinationUrlValue }) {
    const poiRestorePromises = [
      originUrlValue
        ? poiFromUrl(originUrlValue)
        : Promise.resolve(this.state.origin),
      destinationUrlValue
        ? poiFromUrl(destinationUrlValue)
        : Promise.resolve(this.state.destination),
    ];
    Promise.all(poiRestorePromises).then(([ origin, destination ]) => {
      persistentPointState.origin = origin;
      persistentPointState.destination = destination;
      this.setState({
        origin,
        destination,
        isInitializing: false,
      }, this.update);
    }).catch(err => {
      Error.sendOnce(
        'direction_panel',
        'restoreUrl',
        `Error restoring Poi from Url ${originUrlValue} / ${destinationUrlValue}`,
        err,
      );
    });
  }

  computeRoutes = async () => {
    const { origin, destination, vehicle } = this.state;
    if (origin && destination) {
      this.setState({ isDirty: false, isLoading: true, routes: [] });
      const directionResponse = await DirectionApi.search(
        origin,
        destination,
        vehicle,
      );
      if (directionResponse && directionResponse.error === 0) {
        // Valid, non-empty response
        const routes = directionResponse.data.routes.map((route, i) => ({
          ...route,
          isActive: i === 0,
          id: i,
        }));
        this.setState({ isLoading: false, error: 0, routes });
        window.execOnMapLoaded(() => {
          fire('set_route', { routes, vehicle, origin, destination });
        });
      } else {
        // Error or empty response
        this.setState({ isLoading: false, error: directionResponse.error });
        fire('clean_route');
      }
    } else {
      // When both fields are not filled yet or not filled anymore
      this.setState({ isLoading: false, isDirty: false, error: 0, routes: [] });
      fire('clean_route');
    }
  }

  updateUrl() {
    const routeParams = [];
    if (this.state.origin) {
      routeParams.push('origin=' + poiToUrl(this.state.origin));
    }
    if (this.state.destination) {
      routeParams.push('destination=' + poiToUrl(this.state.destination));
    }
    routeParams.push(`mode=${this.state.vehicle}`);
    window.app.navigateTo(`/routes/?${routeParams.join('&')}`, {}, {
      replace: true,
      routeUrl: false,
    });
  }

  update() {
    this.updateUrl();
    this.computeRoutes();
  }

  onSelectVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.setState({ vehicle, isDirty: true }, this.update);
  }

  onClose = () => {
    if (this.state.activePreviewRoute) {
      this.setState({ activePreviewRoute: null });
    } else if (this.props.poi) {
      // indicates we come from a POI panel,
      // let's just trust the router to restore it
      window.history.back();
    } else {
      window.app.navigateTo('/');
    }
  }

  reversePoints = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    persistentPointState.origin = this.state.destination;
    persistentPointState.destination = this.state.origin;
    this.setState(previousState => ({
      origin: previousState.destination,
      destination: previousState.origin,
      isDirty: true,
    }), this.update);
  }

  changeDirectionPoint = (which, value) => {
    persistentPointState[which] = value;
    this.setState({ [which]: value, isDirty: true }, this.update);
  }

  setDirectionPoint = poi => {

    // If both origin and destination are already set, do nothing
    if (persistentPointState.origin !== null && persistentPointState.destination !== null) {
      return;
    }

    // If origin field is empty, set it
    // or, if destination field is empty, set it
    if (persistentPointState.origin === null) {
      persistentPointState.origin = poi;
    } else if (persistentPointState.destination === null) {
      persistentPointState.destination = poi;
    }

    // Update state
    // If both fields are now set, call update() to perform a search and redraw the UI
    this.setState({
      origin: persistentPointState.origin,
      destination: persistentPointState.destination,
      isDirty: true,
    }, this.update);
  }

  openMobilePreview = route => {
    this.setState({ activePreviewRoute: route });
  }

  render() {
    const {
      origin, destination, vehicle,
      routes, error, activePreviewRoute,
      isLoading, isDirty, isInitializing,
    } = this.state;
    const title = <h3 className="itinerary_title">{_('directions', 'direction')}</h3>;
    const form = <DirectionForm
      origin={origin}
      destination={destination}
      onChangeDirectionPoint={this.changeDirectionPoint}
      onReversePoints={this.reversePoints}
      vehicles={this.vehicles}
      onSelectVehicle={this.onSelectVehicle}
      activeVehicle={vehicle}
      isInitializing={isInitializing}
    />;
    const result = <RouteResult
      isLoading={isLoading || routes.length > 0 && isDirty}
      vehicle={vehicle}
      error={error}
      routes={routes}
      origin={origin && origin.getInputValue()}
      destination={destination && destination.getInputValue()}
      openMobilePreview={this.openMobilePreview}
    />;

    return <DeviceContext.Consumer>
      {isMobile => isMobile
        ? <Fragment>
          <div className="direction_panel_mobile">
            <div className="itinerary_close_mobile" onClick={this.onClose}>
              <span className="icon-chevron-left" />
              {_('return', 'direction')}
            </div>
            {title}
            {!activePreviewRoute && form}
          </div>
          {(routes.length > 0 || isLoading) && !activePreviewRoute &&
            <Panel className="directionResult_panel">
              {result}
            </Panel>}
          {activePreviewRoute &&
            <MobileRoadMapPreview steps={getAllSteps(activePreviewRoute)} />}
        </Fragment>
        : <Panel
          title={title}
          close={this.onClose}
          className="direction_panel"
        >
          {form}
          {result}
        </Panel>
      }
    </DeviceContext.Consumer>;
  }
}
