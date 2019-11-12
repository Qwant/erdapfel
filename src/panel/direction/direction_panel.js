import Panel from '../../libs/panel';
import directionTemplate from '../../views/direction/direction.dot';
import DirectionInput from '../../ui_components/direction_input';
import RoadMapPanel from './road_map_panel';
import DirectionApi from '../../adapters/direction_api';
import { modes } from '../../adapters/direction_api';
import LatLonPoi from '../../adapters/poi/latlon_poi';
import Error from '../../adapters/error';
import Device from '../../libs/device';
import Telemetry from '../../libs/telemetry';
import NavigatorGeolocalisationPoi from '../../adapters/poi/specials/navigator_geolocalisation_poi';
import nconf from '@qwant/nconf-getter';

const isPublicTransportEnabled = nconf.get().direction.publicTransport.enabled;

export default class DirectionPanel {
  constructor() {
    this.isPublicTransportEnabled = isPublicTransportEnabled;
    this.panel = new Panel(this, directionTemplate);
    this.vehicles = modes;
    this.active = false;
    this.poiBeforeOpening = null;
    this.origin = null;
    this.destination = null;
    this.vehicle = modes.DRIVING;
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

  setInputValue(type = 'origin', value) {
    if (type === 'origin') {
      this.searchInputStart.value = value;
    } else {
      this.searchInputEnd.value = value;
    }
  }

  initDirection() {
    const originHandler = '#itinerary_input_origin';
    const destinationHandler = '#itinerary_input_destination';
    this.originInput = new DirectionInput(
      originHandler,
      poi => this.selectOrigin(poi),
      'submit_direction_origin',
    );
    this.destinationInput = new DirectionInput(
      destinationHandler,
      poi => this.selectDestination(poi),
      'submit_direction_destination',
    );

    this.searchInputStart = document.querySelector(originHandler);
    this.searchInputEnd = document.querySelector(destinationHandler);
    this.itineraryContainer = document.querySelector('#itinerary_container');

    this.searchInputStart.onfocus = () => {
      this.itineraryContainer.classList.add('itinerary_container--start-focused');
    };

    this.searchInputStart.onblur = () => {
      this.itineraryContainer.classList.remove('itinerary_container--start-focused');
      if (this.originInput.getValue() === '') {
        this.origin = null;
        fire('clean_route');
        this.roadMapPanel.setRoad([], this.vehicle, this.origin, this.destination);
      }
    };

    this.searchInputEnd.onfocus = () => {
      this.itineraryContainer.classList.add('itinerary_container--end-focused');
    };

    this.searchInputEnd.onblur = () => {
      this.itineraryContainer.classList.remove('itinerary_container--end-focused');
      if (this.destinationInput.getValue() === '') {
        this.destination = null;
        fire('clean_route');
        this.roadMapPanel.setRoad([], this.vehicle, this.origin, this.destination);
      }
    };

    if (!this.origin && !this.destination && !Device.isMobile()) {
      this.searchInputStart.focus();
    }
  }

  setVehicle(vehicle) {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.panel.removeClassName(0, `.itinerary_button_label_${this.vehicle}`, 'label_active');
    this.vehicle = vehicle;
    this.panel.addClassName(0, `.itinerary_button_label_${vehicle}`, 'label_active');
    this.updateUrl();
    this.searchDirection();
  }

  invertOriginDestination() {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    const originValue = this.originInput.getValue();
    const destinationValue = this.destinationInput.getValue();
    this.originInput.setValue(destinationValue);
    this.destinationInput.setValue(originValue);
    const tmp = this.origin;
    this.origin = this.destination;
    this.destination = tmp;
    this.searchDirection();
  }

  async selectOrigin(poi) {
    this.origin = poi;
    this.searchDirection();
    this.updateUrl();
    if (!this.destination) {
      fire('fit_map', poi);
    }
    if (!this.destination && !Device.isMobile()) {
      this.searchInputEnd.focus();
    }
  }

  async selectDestination(poi) {
    this.destination = poi;
    this.searchDirection();
    this.updateUrl();
    if (!this.origin) {
      fire('fit_map', poi);
    }
    if (!this.origin && !Device.isMobile()) {
      this.searchInputStart.focus();
    }
  }

  cleanDirection() {
    if (this.originInput && this.destinationInput) {
      this.originInput.destroy();
      this.destinationInput.destroy();
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
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    document.body.classList.remove('directions-open');
    const bottomButtonGroup = document.querySelector('.map_bottom_button_group');
    if (bottomButtonGroup) {
      // buttons may be absent during map loading
      bottomButtonGroup.classList.remove('itinerary_preview--active');
    }
    fire('clean_route');
    this.cleanDirection();
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
    this.initDirection();
    this.updateUrl();
    window.execOnMapLoaded(() => {
      this.searchDirection();
    });
  }

  async searchDirection(options) {
    if (this.origin && this.destination) {
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

        this.roadMapPanel.setRoad(routes, this.vehicle, this.origin, this.destination);
        this.setRoutesOnMap(routes, options);

      } else {
        this.roadMapPanel.showError();
        fire('clean_route');
      }
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

  clearOrigin() {
    setTimeout(() => {
      this.searchInputStart.focus();
    }, 0);
    this.originInput.setValue('');
    this.origin = null;
  }

  clearDestination() {
    setTimeout(() => {
      this.searchInputEnd.focus();
    }, 0);
    this.destinationInput.setValue('');
    this.destination = null;
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
    if (options.mode) {
      if (Object.keys(modes).some(k => modes[k] === options.mode)) {
        this.vehicle = options.mode;
      }
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
