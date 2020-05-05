/* globals _ */
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
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
import IdunnPoi from 'src/adapters/poi/idunn_poi';

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
    isPublicTransportActive: PropTypes.bool,
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
    if (this.props.isPublicTransportActive) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }

    const activeVehicle = this.vehicles.indexOf(props.mode) !== -1
      ? props.mode : modes.DRIVING;

    this.lastQueryId = 0;

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
      originInputText: '',
      destinationInputText: '',
    };

    this.restorePoints(props);
  }

  componentDidMount() {
    document.body.classList.add('directions-open');
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
    this.setPointHandler = listen('set_direction_point', this.setDirectionPoint);
  }

  componentWillUnmount() {
    fire('clean_routes');
    window.unListen(this.dragPointHandler);
    window.unListen(this.setPointHandler);
    document.body.classList.remove('directions-open');
  }

  setTextInput(which, poi) {
    if (poi) {
      if (poi.type === 'latlon') {
        this.getAddress(which, poi);
      } else {
        this.setState({ [which + 'InputText']: poi.getInputValue() || '' });
      }
    } else {
      this.setState({ [which + 'InputText']: '' });
    }
  }

  async getAddress(which, poi) {
    const address = await IdunnPoi.poiApiLoad(poi);
    this.setState({ [which + 'InputText']: address.alternativeName || address.name });
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
      this.setState({
        isDirty: false,
        isLoading: true,
        error: 0,
        routes: [],
      });
      const currentQueryId = ++this.lastQueryId;
      fire('set_origin', origin);
      fire('set_destination', destination);
      const directionResponse = await DirectionApi.search(
        origin,
        destination,
        vehicle,
      );
      // A more recent query was done in the meantime, ignore this result silently
      if (currentQueryId !== this.lastQueryId) {
        return;
      }
      if (directionResponse && directionResponse.error === 0) {
        // Valid, non-empty response
        const routes = directionResponse.data.routes.map((route, i) => ({
          ...route,
          isActive: i === 0,
          id: i,
        }));
        this.setState({ isLoading: false, error: 0, routes });
        window.execOnMapLoaded(() => {
          fire('set_routes', { routes, vehicle });
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
    if (this.props.isPublicTransportActive) {
      routeParams.push('pt=true');
    }
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
      originInputText: previousState.destinationInputText,
      destinationInputText: previousState.originInputText,
      isDirty: true,
    }), this.update);
  }

  changeDirectionPoint = (which, value, point) => {
    persistentPointState[which] = point;
    this.setState({
      [which]: point,
      isDirty: true,
      [which + 'InputText']: value || '',
    }, this.update);

    // Retrieve addresses
    if (point && point.type === 'latlon') {
      this.setTextInput(which, persistentPointState[which]);
    }
  }

  setDirectionPoint = poi => {

    // If both origin and destination are already set, do nothing
    if (persistentPointState.origin !== null && persistentPointState.destination !== null) {
      return;
    }

    // If origin field is empty, set it
    // else, if destination field is empty, set it
    if (persistentPointState.origin === null) {
      persistentPointState.origin = poi;
      this.setTextInput('origin', poi);
    } else if (persistentPointState.destination === null) {
      persistentPointState.destination = poi;
      this.setTextInput('destination', poi);
    }

    // Update state
    // (Call update() that will perform a search and redraw the UI if both fields are set)
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
      originInputText, destinationInputText,
    } = this.state;
    const title = <h3 className="itinerary_title u-text--smallTitle u-center">
      {_('Directions', 'direction')}
    </h3>;
    const form = <DirectionForm
      origin={origin}
      destination={destination}
      originInputText = {originInputText}
      destinationInputText = {destinationInputText}
      onChangeDirectionPoint={this.changeDirectionPoint}
      onReversePoints={this.reversePoints}
      onEmptyOrigin={this.emptyOrigin}
      onEmptyDestination={this.emptyDestination}
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
              <span className="u-firstCap">{_('return', 'direction')}</span>
            </div>
            {title}
            {!activePreviewRoute && form}
          </div>
          {!activePreviewRoute && origin && destination &&
            <Panel className="directionResult_panel" resizable marginTop={160}>
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
