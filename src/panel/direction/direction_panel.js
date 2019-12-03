import React from 'react';
import ReactDOM from 'react-dom';
import Panel from '../../libs/panel';
import directionTemplate from '../../views/direction/direction.dot';
import RoadMapPanel from './road_map_panel';
import DirectionForm from './DirectionForm';
import DirectionApi from '../../adapters/direction_api';
import { modes } from '../../adapters/direction_api';
import LatLonPoi from '../../adapters/poi/latlon_poi';
import Error from '../../adapters/error';
import Telemetry from '../../libs/telemetry';
import NavigatorGeolocalisationPoi from '../../adapters/poi/specials/navigator_geolocalisation_poi';
import nconf from '@qwant/nconf-getter';

export default class DirectionPanel {
  constructor() {
    this.panel = new Panel(this, directionTemplate);
    this.active = false;
    this.poiBeforeOpening = null;
    this.origin = null;
    this.destination = null;
    this.vehicles = [modes.DRIVING, modes.WALKING, modes.CYCLING];
    if (nconf.get().direction.publicTransport.enabled) {
      this.vehicles.splice(1, 0, modes.PUBLIC_TRANSPORT);
    }
    this.vehicle = this.vehicles[0];
    this.roadMapPanel = new RoadMapPanel(this.openMobilePreview);
    this.isRoadMapPreviewActive = false;
  }

  openMobilePreview = () => {
    this.hideForm();
    this.isRoadMapPreviewActive = true;
    const bottomButtonGroup = document.querySelector('.map_bottom_button_group');
    if (bottomButtonGroup) {
      bottomButtonGroup.classList.add('itinerary_preview--active');
    }
  }

  hideForm() {
    this.panel.addClassName(0, '#itinerary_container', 'itinerary_container--preview');
  }

  displayForm() {
    this.panel.removeClassName(0, '#itinerary_container', 'itinerary_container--preview');
  }

  setPoints(origin, destination) {
    ReactDOM.render(
      <DirectionForm
        origin={origin}
        destination={destination}
        onChangeDirectionPoint={this.selectPoint}
        onReversePoints={this.invertOriginDestination}
        vehicles={this.vehicles}
        activeVehicle={this.vehicle}
        onSelectVehicle={this.setVehicle}
      />,
      document.getElementById('react_itinerary_fields')
    );
  }

  updateParameters() {
    this.setPoints(this.origin, this.destination);
    this.searchDirection();
    this.updateUrl();
  }

  setVehicle = vehicle => {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.vehicle = vehicle;
    this.updateParameters();
  }

  invertOriginDestination = () => {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    const tmp = this.origin;
    this.origin = this.destination;
    this.destination = tmp;
    this.updateParameters();
  }

  selectOrigin(poi) {
    this.origin = poi;
    this.updateParameters();
    if (!this.destination && poi) {
      fire('fit_map', poi);
    }
  }

  selectDestination(poi) {
    this.destination = poi;
    this.updateParameters();
    if (!this.origin && poi) {
      fire('fit_map', poi);
    }
  }

  selectPoint = (which, poi) => {
    if (which === 'origin') {
      this.selectOrigin(poi);
    } else if (which === 'destination') {
      this.selectDestination(poi);
    }
  }

  closeAction() {
    if (this.poiBeforeOpening) {
      const { poi, isFromCategory, isFromFavorite } = this.poiBeforeOpening;
      this.poiBeforeOpening = null;
      window.app.navigateTo(`/place/${poi.toUrl()}`, {
        poi: poi.serialize(),
        isFromCategory,
        isFromFavorite,
      });
    } else {
      window.app.navigateTo('/');
    }
  }

  back() {
    if (this.isRoadMapPreviewActive) {
      this.roadMapPanel.close();
      this.isRoadMapPreviewActive = false;
      this.displayForm();
    } else {
      this.closeAction();
    }
  }

  close() {
    if (!this.active) {
      return;
    }
    this.roadMapPanel.close();
    ReactDOM.unmountComponentAtNode(document.getElementById('react_itinerary_fields'));
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    document.body.classList.remove('directions-open');
    const bottomButtonGroup = document.querySelector('.map_bottom_button_group');
    if (bottomButtonGroup) {
      // buttons may be absent during map loading
      bottomButtonGroup.classList.remove('itinerary_preview--active');
    }
    fire('clean_route');
    this.active = false;
    this.panel.update();
  }

  async open(options = {}) {
    document.body.classList.add('directions-open');
    Telemetry.add(Telemetry.ITINERARY_OPEN, null, null,
      options.poi ? Telemetry.buildInteractionData(
        {
          'id': options.poi.id,
          'source': options.poi.meta ? options.poi.meta.source : options.poi.name,
          'template': 'simple',
          'zone': 'detail',
          'element': 'itinerary',
        }
      ) : null
    );
    await this.restoreParams(options);
    this.active = true;
    await this.panel.update();
    this.setPoints(this.origin, this.destination);
    this.updateUrl();
    window.execOnMapLoaded(() => {
      this.searchDirection();
    });
  }

  async searchDirection(options) {
    if (!this.origin || !this.destination) {
      fire('clean_route');
      this.roadMapPanel.setRoad([], this.vehicle, this.origin);
      return;
    }

    this.roadMapPanel.showPlaceholder(this.vehicle);
    const directionResponse = await DirectionApi.search(
      this.origin,
      this.destination,
      this.vehicle,
    );
    if (directionResponse && directionResponse.routes && directionResponse.routes.length > 0) {
      const routes = directionResponse.routes;
      routes.forEach((route, i) => {
        route.isActive = i === 0;
        route.id = i;
      });

      this.roadMapPanel.setRoad(routes, this.vehicle, this.origin);
      this.setRoutesOnMap(routes, options);

    } else {
      this.roadMapPanel.showError();
      fire('clean_route');
    }
  }

  setRoutesOnMap(routes, options) {
    fire('set_route', {
      ...options,
      routes,
      vehicle: this.vehicle,
      origin: this.origin,
      destination: this.destination,
    });
  }

  updateUrl() {
    const routeParams = [];
    if (this.origin) {
      routeParams.push(this.poiToUrl('origin', this.origin));
    }
    if (this.destination) {
      routeParams.push(this.poiToUrl('destination', this.destination));
    }
    routeParams.push(`mode=${this.vehicle}`);
    window.app.navigateTo(`/routes/?${routeParams.join('&')}`, {}, {
      replace: true,
      routeUrl: false,
    });
  }

  async restoreParams(options) {
    if (options.mode && this.vehicles.indexOf(options.mode) !== -1) {
      this.vehicle = options.mode;
    }

    if (options.origin) {
      try {
        this.origin = await LatLonPoi.fromUrl(options.origin);
      } catch (err) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${options.origin}`,
          err,
        );
      }
    }

    if (options.destination) {
      try {
        this.destination = await LatLonPoi.fromUrl(options.destination);
      } catch (err) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${options.destination}`,
          err,
        );
      }
    }

    if (options.poi) {
      this.destination = options.poi;
      this.poiBeforeOpening = options;
    }
  }

  /* Private */

  poiToUrl(prefix, poi) {
    if (poi instanceof NavigatorGeolocalisationPoi || poi instanceof LatLonPoi) {
      return `${prefix}=${poi.toUrl()}`;
    }
    return `${prefix}=${poi.id}@${poi.name}`;
  }
}
