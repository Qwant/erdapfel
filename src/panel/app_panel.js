import React from 'react';
import ReactDOM from 'react-dom';
import PanelsView from '../views/app_panel.dot';
import Panel from '../libs/panel';
import FavoritePanel from './favorites_panel';
import PoiPanel from './poi_panel';
import ServicePanel from './ServicePanel';
import SearchInput from '../ui_components/search_input';
import TopBar from './top_bar';
import MasqFavoriteModal from '../modals/masq_favorite_modal';
import MasqOnboardingModal from '../modals/masq_onboarding_modal';
import MasqErrorModal from '../modals/masq_error_modal';
import MasqActivatingModal from '../modals/masq_activating_modal';
import nconf from '@qwant/nconf-getter';
import DirectionPanel from './direction/direction_panel';
import Menu from './Menu';
import Telemetry from '../libs/telemetry';
import CategoryPanel from './category_panel';
import ApiPoi from '../adapters/poi/idunn_poi';
import Router from 'src/proxies/app_router';
import CategoryService from 'src/adapters/category_service';
import Poi from 'src/adapters/poi/poi.js';
import layouts from './layouts.js';
import ReactPanelWrapper from 'src/panel/reactPanelWrapper';
import { parseMapHash, parseQueryString, joinPath, getCurrentUrl } from 'src/libs/url_utils';

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

    this.servicePanel = new ReactPanelWrapper(ServicePanel);
    this.favoritePanel = new FavoritePanel();
    this.poiPanel = new PoiPanel();
    this.categoryPanel = this.categoryEnabled ? new CategoryPanel() : null;
    this.directionPanel = this.directionEnabled ? new DirectionPanel() : null;

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

    this.masqEnabled = masqEnabled;
    if (this.masqEnabled) {
      this.masqFavoriteModal = new MasqFavoriteModal();
      this.masqOnboardingModal = new MasqOnboardingModal();
      this.masqErrorModal = new MasqErrorModal();
      this.masqActivatingModal = new MasqActivatingModal();
    }

    if (performanceEnabled) {
      this.panel.onRender = () => {
        window.times.appRendered = Date.now();
      };
    }

    this.panel.render();
    ReactDOM.render(<Menu />, document.querySelector('.react_menu__container'));
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
    this.router = new Router(window.baseUrl);

    this.router.addRoute('Category', '/places/(.*)', placesParams => {
      window.execOnMapLoaded(() => {
        this.openCategory(parseQueryString(placesParams));
      });
    });

    this.router.addRoute('POI', '/place/(.*)', async (poiUrl, options) => {
      const poiId = poiUrl.split('@')[0];
      this.setPoi(poiId, options || {});
    });

    this.router.addRoute('Favorites', '/favs', () => {
      this.openFavorite();
    });

    this.router.addRoute('Routes', '/routes(?:/?)(.*)', (routeParams, options) => {
      fire('move_mobile_bottom_ui', 0);
      this.openDirection({ ...parseQueryString(routeParams), ...options });
    });

    this.router.addRoute('Direct search query', '/([?].*)', queryString => {
      const params = parseQueryString(queryString);
      if (params.q) {
        SearchInput.executeSearch(params.q);
      } else {
        this.navigateTo('/');
      }
    });

    // Default matching route
    this.router.addRoute('Services', '(?:/?)', (_, options = {}) => {
      this.resetLayout();
      if (options.focusSearch) {
        SearchInput.select();
      }
    });

    window.onpopstate = ({ state }) => {
      this.router.routeUrl(getCurrentUrl(), state);
    };

    // Route the initial URL
    this.router.routeUrl(getCurrentUrl());
  }

  navigateTo(url, state = {}, replace = false) {
    const urlWithCurrentHash = joinPath([window.baseUrl, url]) + location.hash;
    if (replace) {
      window.history.replaceState(state, null, urlWithCurrentHash);
    } else {
      window.history.pushState(state, null, urlWithCurrentHash);
      this.router.routeUrl(urlWithCurrentHash, state);
    }
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
      if (this.directionPanel.active) {
        this.navigateTo('/');
      } else {
        this.unminify();
      }
    } else {
      this.minify();
    }
  }

  _updateMapPoi(poi, options = {}) {
    window.execOnMapLoaded(function() {
      fire('map_mark_poi', poi, options);
    });
  }

  openPoiPanel(poi, options = {}) {
    this.panels.forEach(panel => {
      if (panel === this.poiPanel) {
        panel.setPoi(poi, options);
      } else if (panel === this.categoryPanel) {
        const keepCategoryMarkers = options.isFromCategory;
        panel.close(keepCategoryMarkers);
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
    this.activePoiId = poiId;

    options.layout = options.layout || layouts.POI;

    // If a POI object is provided before fetching full data,
    // we can update the map immediately for UX responsiveness
    const shallowPoi = options.poi && Poi.deserialize(options.poi);
    const updateMapEarly = !!shallowPoi;
    if (updateMapEarly) {
      this._updateMapPoi(shallowPoi, options);
    }

    let poi;
    if (window.hotLoadPoi && window.hotLoadPoi.id === poiId) {
      Telemetry.add(Telemetry.POI_RESTORE);
      poi = new ApiPoi(window.hotLoadPoi);
      options.centerMap = true;
    } else {
      poi = await ApiPoi.poiApiLoad(options.poi || { id: poiId });
    }

    // fallback on the simple POI object from the map
    // if Idunn doesn't know this POI
    poi = poi || shallowPoi;

    if (!poi) {
      this.navigateTo('/');
    } else {
      this.openPoiPanel(poi, options);
      if (!updateMapEarly) {
        this._updateMapPoi(poi, options);
      }
    }
  }

  _openPanel(panelToOpen, options) {
    this.unminify();
    this.activePoiId = null;
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
    SearchInput.minify();
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
