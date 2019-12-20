import React from 'react';
import ReactDOM from 'react-dom';
import FavoritesPanel from './favorites/FavoritesPanel';
import PoiPanel from './PoiPanel';
import ServicePanel from './ServicePanel';
import EventListPanel from './event/EventListPanel';
import SearchInput from '../ui_components/search_input';
import TopBar from './top_bar';
import nconf from '@qwant/nconf-getter';
import Menu from './Menu';
import Telemetry from '../libs/telemetry';
import CategoryPanel from 'src/panel/category/CategoryPanel';
import Router from 'src/proxies/app_router';
import ReactPanelWrapper from 'src/panel/reactPanelWrapper';
import events from 'config/events.yml';
import { parseMapHash, parseQueryString, joinPath, getCurrentUrl } from 'src/libs/url_utils';
import DirectionPanel from 'src/panel/direction/DirectionPanel';
import Device from '../libs/device';

const performanceEnabled = nconf.get().performance.enabled;
const directionEnabled = nconf.get().direction.enabled;
const categoryEnabled = nconf.get().category.enabled;
const eventEnabled = nconf.get().events.enabled;

export default class AppPanel {
  constructor() {
    this.topBar = new TopBar();
    SearchInput.initSearchInput('#search');
    this.categoryEnabled = categoryEnabled;
    this.eventEnabled = eventEnabled;
    this.directionEnabled = directionEnabled;

    this.servicePanel = new ReactPanelWrapper(ServicePanel);
    this.favoritePanel = new ReactPanelWrapper(FavoritesPanel);
    this.poiPanel = new ReactPanelWrapper(PoiPanel);
    this.categoryPanel = this.categoryEnabled ? new ReactPanelWrapper(CategoryPanel) : null;
    this.eventListPanel = this.eventEnabled ? new ReactPanelWrapper(EventListPanel) : null;
    this.directionPanel = this.directionEnabled ? new ReactPanelWrapper(DirectionPanel) : null;

    this.panels = [
      this.servicePanel,
      this.favoritePanel,
      this.poiPanel,
    ];
    if (this.categoryEnabled) {
      this.panels.push(this.categoryPanel);
    }
    if (this.eventEnabled) {
      this.panels.push(this.eventListPanel);
    }
    if (this.directionPanel) {
      this.panels.push(this.directionPanel);
    }

    ReactDOM.render(<Menu />, document.querySelector('.react_menu__container'));
    Telemetry.add(Telemetry.APP_START, null, null, {
      'language': window.getLang(),
      'is_mobile': Device.isMobile(),
    });

    this.initRouter();
    if (performanceEnabled) {
      window.times.appRendered = Date.now();
      listen('map_loaded', () => {
        window.times.mapLoaded = Date.now();
      });
    }

    const mapHash = parseMapHash(window.location.hash);
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

    this.router.addRoute('EventListPanel', '/events/(.*)', eventsParams => {
      window.execOnMapLoaded(() => {
        this.openEvents(parseQueryString(eventsParams));
      });
    });

    this.router.addRoute('POI', '/place/(.*)', async (poiUrl, options = {}) => {
      const poiId = poiUrl.split('@')[0];
      this.activePoiId = poiId;
      this.openPoi({ ...options, poiId });
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
    this.router.addRoute('Services', '/?', (_, options = {}) => {
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

  /**
  * @param {string} url - The URL to navigate to.
  * @param {Object} state - State object to associate with the history entry.
  * @param {Object} options
  * @param {boolean} options.replace - If true, the new state/url will replace the current state in browser history
  * @param {boolean} options.routeUrl- If true, the new URL will be evaluated by the router.
  */
  navigateTo(url, state = {}, { replace = false, routeUrl = true } = {}) {
    const urlWithCurrentHash = joinPath([window.baseUrl, url]) + location.hash;
    if (replace) {
      window.history.replaceState(state, null, urlWithCurrentHash);
    } else {
      window.history.pushState(state, null, urlWithCurrentHash);
    }
    if (routeUrl) {
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

  _openPanel(panelToOpen, options = {}) {
    this.unminify();
    if (panelToOpen !== this.poiPanel) {
      this.activePoiId = null;
    }
    this.panels
      .filter(panel => panel !== panelToOpen)
      .forEach(panel => {
        if (panelToOpen !== this.poiPanel || !options.isFromCategory) {
          fire('remove_category_markers');
          fire('remove_event_markers');
        }
        if (panel === this.poiPanel) {
          fire('clean_marker');
          SearchInput.setInputValue('');
        }
        panel.close();
      });
    panelToOpen.open(options);
  }

  openDirection(options) {
    this._openPanel(this.directionPanel, options);
    SearchInput.minify();
  }

  openFavorite() {
    this._openPanel(this.favoritePanel);
  }

  openCategory(params) {
    const { type: categoryName, q: query, ...otherOptions } = params;
    this._openPanel(this.categoryPanel, {
      categoryName,
      query,
      ...otherOptions,
    });
  }

  openEvents(params) {
    const { type: eventName, ...otherOptions } = params;
    if (events.find(ev => ev.name === params.type)) {
      this._openPanel(this.eventListPanel, {
        eventName,
        ...otherOptions,
      });
    } else {
      window.app.navigateTo('/');
    }
  }

  openPoi(options) {
    this._openPanel(this.poiPanel, options);
  }

  resetLayout() {
    this._openPanel(this.servicePanel);
  }
}
