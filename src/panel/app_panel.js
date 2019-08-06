import PanelsView from '../views/app_panel.dot';
import Panel from '../libs/panel';
import FavoritePanel from './favorites_panel';
import PoiPanel from './poi_panel';
import ServicePanel from './service_panel';
import Share from '../modals/share';
import SearchInput from '../ui_components/search_input';
import TopBar from './top_bar';
import GeolocationModal from '../modals/geolocation_modal';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';
import MasqErrorModal from '../modals/masq_error_modal';
import MasqActivatingModal from '../modals/masq_activating_modal';
import nconf from '@qwant/nconf-getter';
import DirectionPanel from './direction/direction_panel';
import Menu from './menu';
import Telemetry from '../libs/telemetry';
import CategoryPanel from './category_panel';
import ApiPoi from '../adapters/poi/idunn_poi';
import Router from 'src/proxies/app_router';
import CategoryService from 'src/adapters/category_service';
import Poi from 'src/adapters/poi/poi.js';
import layouts from './layouts.js';
import { parseMapHash, parseQueryString } from 'src/libs/url_utils';

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const masqEnabled = nconf.get().masq.enabled;
const categoryEnabled = nconf.get().category.enabled;

export default class AppPanel {
  constructor(parent) {
    this.topBar = new TopBar();
    SearchInput.initSearchInput('#search');
    this.categoryEnabled = categoryEnabled;
    this.directionEnabled = directionEnabled;

    this.sharePanel = new Share();
    this.servicePanel = new ServicePanel();
    this.favoritePanel = new FavoritePanel(this.sharePanel);
    this.poiPanel = new PoiPanel(this.sharePanel);
    this.categoryPanel = this.categoryEnabled ? new CategoryPanel() : null;
    this.directionPanel = this.directionEnabled ? new DirectionPanel(this.sharePanel) : null;

    this.panels = [
      this.servicePanel,
      this.favoritePanel,
      this.poiPanel,
    ];
    if (this.categoryEnabled) {
      this.panels.push(this.categoryPanel);
    }
    if (this.directionPanel) {
      this.panels.push(this.directionPanel);
    }

    this.panel = new Panel(this, PanelsView, parent);
    this.geolocationModal = new GeolocationModal();

    this.masqEnabled = masqEnabled;
    if (this.masqEnabled) {
      this.masqFavoriteModal = new MasqFavoriteModal();
      this.masqOnboardingModal = new MasqOnboardingModal();
      this.masqErrorModal = new MasqErrorModal();
      this.masqActivatingModal = new MasqActivatingModal();
    }

    this.menu = new Menu();

    if (performanceEnabled) {
      this.panel.onRender = () => {
        window.times.appRendered = Date.now();
      };
    }

    this.panel.render();
    Telemetry.add(Telemetry.APP_START);

    const mapHash = parseMapHash(window.location.hash);
    this.initRouter();
    this.initMap(mapHash);
  }

  initMap(mapHash) {
    import(/* webpackChunkName: "map" */ '../adapters/scene')
      .then(({ default: Scene }) => {
        this.scene = new Scene();
        this.scene.initScene(mapHash);
      });
  }

  initRouter() {
    this.router = new Router();

    this.router.addRoute('Category', '/places/(.*)', placesParams => {
      this.openCategory(parseQueryString(placesParams));
    });

    this.router.addRoute('POI', '/place/(.*)', async (poiUrl, options) => {
      const poiId = poiUrl.split('@')[0];
      this.setPoi(poiId, options || {});
    });

    this.router.addRoute('Favorites', '/favs', () => {
      this.openFavorite();
    });

    this.router.addRoute('Routes', '/routes(?:/?)(.*)', routeParams => {
      this.openDirection(parseQueryString(routeParams));
    });

    this.router.addRoute('Direct search query', '/?q=(.*)', query => {
      SearchInput.executeSearch(query);
    });

    // Default, fallback matching route
    this.router.addRoute('Services', '(?:/?)', () => {
      this.resetLayout();
    });

    window.onpopstate = ({ state }) => {
      this.router.routeUrl(window.location.href, state);
    };

    // Route the initial URL
    this.router.routeUrl(window.location.href);
    // @TODO: manage async map initial view
  }

  navigateTo(url, state = {}) {
    const urlWithCurrentHash = url + location.hash;
    window.history.pushState(state, null, urlWithCurrentHash);
    this.router.routeUrl(urlWithCurrentHash, state);
  }

  replaceUrl(url, state = {}) {
    const urlWithCurrentHash = url + location.hash;
    window.history.replaceState(state, null, urlWithCurrentHash);
  }

  updateHash(hash) {
    const urlWithoutHash = window.location.href.split('#')[0];
    window.history.replaceState(window.history.state, null, `${urlWithoutHash}#${hash}`);
  }

  minify() {
    SearchInput.minify();
    document.querySelector('.side_panel__container').classList.add('side_panel__container--hidden');
  }

  unminify() {
    document.querySelector('.side_panel__container')
      .classList
      .remove('side_panel__container--hidden');
    SearchInput.unminify();
  }

  toggleMinify() {
    if (SearchInput.isMinified()) {
      this.unminify();
    } else {
      this.minify();
    }
  }

  _updateMapPoi(poi, options = {}) {
    window.execOnMapLoaded(function() {
      if (!options.isFromCategory) {
        fire('map_mark_poi', poi, options);
      }
    });
  }

  openPoiPanel(poi, options = {}) {
    this.panels.forEach(panel => {
      if (panel === this.poiPanel) {
        panel.setPoi(poi, options);
      } else {
        panel.close();
      }
    });
    this.unminify();
  }

  emptyClickOnMap() {
    this.panels.forEach(p => {
      if (p.emptyClickOnMap) {
        p.emptyClickOnMap();
      }
    });
  }

  async setPoi(poiId, options) {
    options.layout = options.layout || layouts.POI;
    if (options.poi) {
      // If a POI object is provided before fetching full data,
      // update the map immediately for UX responsiveness
      this._updateMapPoi(Poi.deserialize(options.poi), options);
    }

    let poi;
    if (window.hotLoadPoi && window.hotLoadPoi.id === poiId) {
      Telemetry.add(Telemetry.POI_RESTORE);
      poi = new ApiPoi(window.hotLoadPoi);
      options.centerMap = true;
    } else {
      poi = await ApiPoi.poiApiLoad(poiId);
    }

    if (!poi) {
      this.navigateTo('/');
    } else {
      this.openPoiPanel(poi, options);
      if (!options.poi) {
        this._updateMapPoi(poi, options);
      }
    }
  }

  _openPanel(panelToOpen, options) {
    /*
      "unminify" needs to be called before panel.open :
      DirectionPanel will minify the main search input (unused for Directions)
    */
    this.unminify();
    this.panels.forEach(panel => {
      if (panel === panelToOpen) {
        panel.open(options);
      } else {
        panel.close();
      }
    });
  }

  openDirection(options) {
    this._openPanel(this.directionPanel, options);
  }

  openFavorite() {
    this._openPanel(this.favoritePanel);
  }

  openCategory(params) {
    const { type: categoryName, ...otherOptions } = params;
    this._openPanel(this.categoryPanel, {
      category: CategoryService.getCategoryByName(categoryName),
      ...otherOptions,
    });
  }

  resetLayout() {
    this._openPanel(this.servicePanel);
  }
}
