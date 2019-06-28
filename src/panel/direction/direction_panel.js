import Panel from '../../libs/panel';
import directionTemplate from '../../views/direction/direction.dot';
import DirectionInput from '../../ui_components/direction_input';
import RoadMapPanel from './road_map_panel';
import DirectionApi from '../../adapters/direction_api';
import SearchInput from '../../ui_components/search_input';
import LatLonPoi from '../../adapters/poi/latlon_poi';
import UrlState from '../../proxies/url_state';
import Error from '../../adapters/error';
import Device from '../../libs/device';
import Telemetry from '../../libs/telemetry';
import NavigatorGeolocalisationPoi from '../../adapters/poi/specials/navigator_geolocalisation_poi';
import {vehiculeMatching} from '../../adapters/direction_api';

export default class DirectionPanel {
  constructor(roadPanel) {
    this.panel = new Panel(this, directionTemplate);
    this.vehicles = {DRIVING: 'driving', WALKING: 'walking', CYCLING: 'cycling'};
    this.active = false;
    this.poiBeforeOpening = null;
    this.origin = null;
    this.destination = null;
    this.vehicle = this.vehicles.DRIVING;
    this.roadMapPanel = new RoadMapPanel(
      () => this.handleOpen(),
      () => this.handleClose(),
      roadPanel,
    );
    PanelManager.register(this);
    UrlState.registerResource(this, 'routes');
    this.activePanel = this;
  }

  handleOpen() {
    this.hideForm();
    this.activePanel = this.roadMapPanel;
  }

  handleClose() {
    this.displayForm();
    this.activePanel = this;
  }

  hideForm() {
    this.panel.addClassName(0, '#itinerary_container', 'itinerary_container--preview');
  }

  displayForm() {
    this.panel.removeClassName(0, '#itinerary_container', 'itinerary_container--preview');
  }

  setInputValue(type = 'origin', value) {
    type == 'origin' ? this.searchInputStart.value = value : this.searchInputEnd.value = value;
  }

  initDirection() {
    let originHandler = '#itinerary_input_origin';
    let destinationHandler = '#itinerary_input_destination';
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
        this.roadMapPanel.setRoad([], this.vehicle, this.origin);
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
        this.roadMapPanel.setRoad([], this.vehicle, this.origin);
      }
    };

    if (!this.origin && !Device.isMobile()) {
      this.searchInputStart.focus();
    }
  }

  setVehicle(vehicle) {
    Telemetry.add(Telemetry[`${('itinerary_mode_' + vehicle).toUpperCase()}`]);
    this.panel.removeClassName(0, `.itinerary_button_label_${this.vehicle}`, 'label_active');
    this.vehicle = vehicle;
    this.panel.addClassName(0, `.itinerary_button_label_${vehicle}`, 'label_active');
    UrlState.pushUrl();
    this.searchDirection();
  }

  invertOriginDestination() {
    Telemetry.add(Telemetry.ITINERARY_INVERT);
    let originValue = this.originInput.getValue();
    let destinationValue = this.destinationInput.getValue();
    this.originInput.setValue(destinationValue);
    this.destinationInput.setValue(originValue);
    let tmp = this.origin;
    this.origin = this.destination;
    this.destination = tmp;
    this.searchDirection();
  }

  async selectOrigin(poi) {
    this.origin = poi;
    this.searchDirection();
    UrlState.pushUrl();
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
    UrlState.pushUrl();
    if (!this.origin) {
      fire('fit_map', poi);
    }
    if (!this.origin && !Device.isMobile()) {
      this.searchInputStart.focus();
    }
  }

  /* panel manager implementation */
  toggle(options) {
    if (this.active) {
      this.close();
    } else {
      this.open(options);
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
      const { poi, isFromList, isFromFavorite } = this.poiBeforeOpening;
      return PanelManager.setPoi(poi, { isFromList, isFromFavorite });
    }
    return PanelManager.resetLayout();
  }

  back() {
    this.activePanel.closeAction();
  }

  close() {
    if (!this.active) {
      return;
    }
    Telemetry.add(Telemetry.ITINERARY_CLOSE);
    document.querySelector('#panels').classList.remove('panels--direction-open');
    document.querySelector('.top_bar').classList.remove('top_bar--direction-open');
    const bottomButtonGroup = document.querySelector('.map_bottom_button_group');
    if (bottomButtonGroup) {
      // buttons may be absent during map loading
      bottomButtonGroup.classList.remove('itinerary_preview--active');
    }
    fire('clean_route');
    this.cleanDirection();
    this.active = false;
    this.panel.update();
    UrlState.pushUrl();
  }

  async open(options = {}) {
    Telemetry.add(Telemetry.ITINERARY_OPEN, null, null,
      options.poi ? Telemetry.buildInteractionData(
        {
          'id': options.poi.id,
          'source': options.poi.meta.source,
          'template': 'simple',
          'zone': 'detail',
          'element': 'itinerary',
        }
      ) : null
    );
    document.querySelector('#panels').classList.add('panels--direction-open');
    document.querySelector('.top_bar').classList.add('top_bar--direction-open');
    if (options.poi) {
      this.destination = options.poi;
      this.poiBeforeOpening = options;
    }
    SearchInput.minify();
    this.active = true;
    await this.panel.update();
    this.initDirection();
    UrlState.pushUrl();
    window.execOnMapLoaded(() => {
      this.searchDirection();
    });
  }

  async searchDirection(options) {
    if (this.origin && this.destination) {

      this.roadMapPanel.showPlaceholder(this.vehicle);
      let directionResponse = await DirectionApi.search(
        this.origin,
        this.destination,
        this.vehicle,
      );
      if (directionResponse && directionResponse.routes) {
        let routes = directionResponse.routes;
        routes.forEach((route, i) => {
          route.isActive = i === 0;
          route.id = i;
        });

        this.roadMapPanel.hidePlaceholder();
        this.roadMapPanel.setRoad(routes, this.vehicle, this.origin);
        this.setRoutesOnMap(routes, options);

      } else {
        this.roadMapPanel.hidePlaceholder();
        this.roadMapPanel.showError();
      }
    }
  }

  setRoutesOnMap(routes, options) {
    fire('set_route', {
      ...options,
      routes: routes,
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

  /* urlState interface implementation */

  async restore() {
    await this.restoreUrl();
  }

  store() {
    if (this.active) {
      let routeParams = [];
      if (this.origin) {
        routeParams.push(this.poiToUrl('origin', this.origin));
      }
      if (this.destination) {
        routeParams.push(this.poiToUrl('destination', this.destination));
      }
      if (routeParams.length > 0) {
        return `?${routeParams.join('&')}&mode=${this.vehicle}`;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  async restoreUrl() {
    let getParams = new URLSearchParams(window.location.search);
    if (getParams.get('mode')) {
      let urlVehicle = getParams.get('mode');
      let matchedVehicle = Object.keys(vehiculeMatching)
        .find(vehiculeMatchingItem => vehiculeMatchingItem === urlVehicle);
      if (matchedVehicle) {
        this.vehicle = matchedVehicle;
      }
    }

    if (getParams.get('origin')) {
      try {
        this.origin = await LatLonPoi.fromUrl(getParams.get('origin'));
      } catch (err) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${getParams.get('origin')}`,
          err,
        );
      }
    }
    if (getParams.get('destination')) {
      try {
        this.destination = await LatLonPoi.fromUrl(getParams.get('destination'));
      } catch (err) {
        Error.sendOnce(
          'direction_panel',
          'restoreUrl',
          `Error restoring Poi from Url ${getParams.get('destination')}`,
          err,
        );
      }
    }

    PanelManager.openDirection();
  }

  /* Private */

  poiToUrl(prefix, poi) {
    if (poi instanceof NavigatorGeolocalisationPoi || poi instanceof LatLonPoi) {
      return `${prefix}=${poi.toUrl()}`;
    }
    return `${prefix}=${poi.id}@${poi.name}`;
  }
}
