/* globals _ */
import React from 'react';
import PropTypes from 'prop-types';
import Panel from 'src/components/ui/Panel';
import DirectionForm from './DirectionForm';
import RouteResult from './RouteResult';
import DirectionApi, { modes } from 'src/adapters/direction_api';
import Telemetry from 'src/libs/telemetry';
import nconf from '@qwant/nconf-getter';
import LatLonPoi from 'src/adapters/poi/latlon_poi';
import Device from 'src/libs/device';
import Error from 'src/adapters/error';

const poiUrlValue = poi =>
  typeof poi.toUrl === 'function' ? poi.toUrl() : `${poi.id}@${poi.name}`;

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
      destination: props.poi || persistentPointState.destination || null,
      isLoading: false,
      isDirty: true, // useful to track intermediary states, when API update call is not made yet
      error: false,
      routes: [],
      activePreviewRoute: null,
      isInitializing: true,
    };

    this.restorePoints(props);
  }

  componentDidMount() {
    document.body.classList.add('directions-open');
    this.dragPointHandler = listen('change_direction_point', this.changeDirectionPoint);
  }

  componentWillUnmount() {
    fire('clean_route');
    window.unListen(this.dragPointHandler);
    document.body.classList.remove('directions-open');
  }

  restorePoints({ origin: originUrlValue, destination: destinationUrlValue }) {
    const poiRestorePromises = [
      originUrlValue
        ? LatLonPoi.fromUrl(originUrlValue)
        : Promise.resolve(this.state.origin),
      destinationUrlValue
        ? LatLonPoi.fromUrl(destinationUrlValue)
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
      if (directionResponse && directionResponse.routes && directionResponse.routes.length > 0) {
        const routes = directionResponse.routes.map((route, i) => ({
          ...route,
          isActive: i === 0,
          id: i,
        }));
        this.setState({ isLoading: false, error: false, routes });
        window.execOnMapLoaded(() => {
          fire('set_route', { routes, vehicle, origin, destination });
        });
      } else {
        this.setState({ isLoading: true, error: true });
        fire('clean_route');
      }
    } else {
      this.setState({ isDirty: false, routes: [] });
    }
  }

  updateUrl() {
    const routeParams = [];
    if (this.state.origin) {
      routeParams.push('origin=' + poiUrlValue(this.state.origin));
    }
    if (this.state.destination) {
      routeParams.push('destination=' + poiUrlValue(this.state.destination));
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
      openMobilePreview={this.openMobilePreview}
      previewRoute={activePreviewRoute}
    />;

    if (Device.isMobile()) {
      return <div className="direction_panel_mobile">
        <div className="itinerary_close_mobile" onClick={this.onClose}>
          <span className="icon-chevron-left" />
          {_('return', 'direction')}
        </div>
        {title}
        {!activePreviewRoute && form}
        {result}
      </div>;
    }

    return <Panel
      title={title}
      close={this.onClose}
      className="direction_panel"
    >
      {form}
      {result}
    </Panel>;
  }
}
