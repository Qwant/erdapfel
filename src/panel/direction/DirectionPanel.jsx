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
import * as address from '../../libs/address';
import { CloseButton, Flex } from '../../components/ui';

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

    this.vehicles = [modes.DRIVING, modes.WALKING, modes.CYCLING];
    if (this.props.isPublicTransportActive) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }

    const activeVehicle = this.vehicles.indexOf(props.mode) !== -1
      ? props.mode : modes.DRIVING;

    this.lastQueryId = 0;

    this.state = {
      vehicle: activeVehicle,
      origin: null,
      destination:
        (props.poi && Poi.deserialize(props.poi)) || null,
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
    Telemetry.add(Telemetry.ITINERARY_OPEN);
    document.body.classList.add('directions-open');
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
    this.setPointHandler = listen('set_direction_point', this.setDirectionPoint);
  }

  componentWillUnmount() {
    fire('clean_routes');
    unListen(this.dragPointHandler);
    unListen(this.setPointHandler);
    document.body.classList.remove('directions-open');
  }

  async setTextInput(which, poi) {
    if (poi.type === 'latlon') {
      poi.address = await address.fetch(poi);
    }

    const inputValue = poi.type === 'latlon' ? poi.address.street : poi.name;
    this.setState({ [which + 'InputText']: inputValue });
  }

  restorePoints({ origin: originUrlValue, destination: destinationUrlValue }) {
    const poiRestorePromises = [
      originUrlValue ? poiFromUrl(originUrlValue) : this.state.origin,
      destinationUrlValue ? poiFromUrl(destinationUrlValue) : this.state.destination,
    ];
    Promise.all(poiRestorePromises).then(([ origin, destination ]) => {
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
    } else {
      Telemetry.add(Telemetry.ITINERARY_CLOSE);
      window.app.navigateTo('/');
    }
  }

  reversePoints = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    this.setState(previousState => ({
      origin: previousState.destination,
      destination: previousState.origin,
      originInputText: previousState.destinationInputText,
      destinationInputText: previousState.originInputText,
      isDirty: true,
    }), this.update);
  }

  changeDirectionPoint = (which, value, point) => {
    this.setState({
      [which]: point,
      isDirty: true,
      [which + 'InputText']: value || '',
      activePreviewRoute: null,
    }, () => {
      this.update();
      // Retrieve addresses
      if (point && point.type === 'latlon') {
        this.setTextInput(which, this.state[which]);
      }
    });
  }

  setDirectionPoint = poi => {
    if (this.state.origin && this.state.destination) {
      return;
    }
    const which = this.state.origin ? 'destination' : 'origin';
    this.setTextInput(which, poi);

    // Update state
    // (Call update() that will perform a search and redraw the UI if both fields are set)
    this.setState({
      [which]: poi,
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
    const title = <h3 className="direction-title u-text--title u-firstCap">
      {_('calculate an itinerary', 'direction')}
    </h3>;
    const form = <DirectionForm
      isLoading={isLoading}
      isDirty={isDirty}
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
      origin={originInputText}
      destination={destinationInputText}
      openMobilePreview={this.openMobilePreview}
    />;

    return <DeviceContext.Consumer>
      {isMobile => isMobile
        ? <Fragment>
          <div className="direction-panel">
            <Flex
              className="direction-panel-header"
              alignItems="center"
              justifyContent="space-between">
              {title}
              <CloseButton onClick={this.onClose} />
            </Flex>
            {!activePreviewRoute && form}
            {<div
              id="direction-autocomplete_suggestions"
              className="direction-autocomplete_suggestions"
            />}
          </div>
          {!activePreviewRoute && origin && destination &&
            <Panel resizable marginTop={160} >
              {result}
            </Panel>}
          {activePreviewRoute &&
            <MobileRoadMapPreview steps={getAllSteps(activePreviewRoute)} />}
        </Fragment>
        : <Panel
          className="direction-panel"
          onClose={this.onClose}
          renderHeader={form}
        >
          <div id="direction-autocomplete_suggestions" />
          {result}
        </Panel>}
    </DeviceContext.Consumer>;
  }
}
