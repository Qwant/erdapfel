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

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const masqEnabled = nconf.get().masq.enabled;
const categoryEnabled = nconf.get().category.enabled;

function parseQueryString(queryString) {
  const params = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

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

    this.activePoiId = null;

    if (performanceEnabled) {
      this.panel.onRender = () => {
        window.times.appRendered = Date.now();
      };
    }

    this.panel.render();
    Telemetry.add(Telemetry.APP_START);

    this.initRouter();
  }

  initRouter() {
    this.router = new Router();

    this.router.addRoute('Category', '/places/(.*)', placesParams => {
      this.openCategory(parseQueryString(placesParams));
    });

    this.router.addRoute('POI', '/place/(.*)', async (poiId, options) => {
      const poi = await ApiPoi.poiApiLoad(poiId);
      if (!poi) {
        this.navigateTo('/');
      } else {
        this.setPoi(poi, options);
      }
    });

    this.router.addRoute('Favorites', '/favs', () => {
      this.openFavorite();
    });

    this.router.addRoute('Routes', '/routes/(.*)', routeParams => {
      this.openDirection(parseQueryString(routeParams));
    });

    // Default, fallback matching route
    this.router.addRoute('Services', '/', () => {
      this.resetLayout();
    });

    window.onpopstate = ({ state }) => {
      console.log('Restore URL:', window.location.href, state);
      this.router.routeUrl(window.location.href, state);
    };
  }

  navigateTo(url, state = {}) {
    console.log('NAV_TO', url, state);
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
    console.log('Update hash', urlWithoutHash);
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
        fire('map_mark_poi', poi);
      }
      if (!options.disableMapPan) {
        fire('fit_map', poi, options.layout);
      }
    });
  }

  async setPoi(poi, options = {}, updateMap = true) {
    console.log(poi);
    this.activePoiId = poi.id;
    if (updateMap) {
      this._updateMapPoi(poi, options);
    }
    this.panels.forEach(panel => {
      if (panel.isPoiCompliant) {
        panel.setPoi(poi, options);
      } else {
        panel.close();
      }
    });
    this.unminify();
  }

  async loadPoi(poi, options) {
    this._updateMapPoi(poi, options);
    this.navigateTo(`/place/${poi.id}`, options);
  }

  unsetPoi() {
    this.activePoiId = null;
    fire('clean_marker');
  }

  emptyClickOnMap() {
    this.panels.forEach(p => {
      if (p.emptyClickOnMap) {
        p.emptyClickOnMap();
      }
    });
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
