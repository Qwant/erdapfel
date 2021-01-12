import React from 'react';
import ReactDOM from 'react-dom';
import SearchInput from '../ui_components/search_input';
import nconf from '@qwant/nconf-getter';
import Router from 'src/proxies/app_router';
import { parseMapHash, joinPath, getCurrentUrl } from 'src/libs/url_utils';
import { listen } from 'src/libs/customEvents';
import RootComponent from './RootComponent';
import Telemetry from 'src/libs/telemetry';

const burgerMenuEnabled = nconf.get().burgerMenu.enabled;

if (!burgerMenuEnabled) {
  document.body.classList.add('no-burger');
}

export default class App {
  constructor() {
    this.initMap();
    SearchInput.initSearchInput('#search');
    listen('map_loaded', () => {
      window.times.mapLoaded = Date.now();
      Telemetry.add(Telemetry.PERF_MAP_FIRST_RENDER, {
        app_render: window.times.appRendered - window.times.init,
        mapbox_init: window.times.initMapBox - window.times.init,
        map_first_render: window.times.mapLoaded - window.times.initMapBox,
      });
    });

    this.router = new Router(window.baseUrl);

    window.onpopstate = ({ state }) => {
      this.router.routeUrl(getCurrentUrl(), state || {});
    };

    const directionShortcut = document.querySelector('.search_form__direction_shortcut');
    if (directionShortcut) {
      directionShortcut.addEventListener('click', () => {
        Telemetry.add(Telemetry.HOME_ITINERARY);
        this.navigateTo('/routes');
      });
    }

    ReactDOM.render(
      <RootComponent
        router={this.router}
        burgerMenuEnabled={burgerMenuEnabled}
      />,
      document.querySelector('#react_root')
    );
  }

  initMap() {
    const mapHash = parseMapHash(window.location.hash);
    import(/* webpackChunkName: "map" */ '../adapters/scene')
      .then(({ default: Scene }) => {
        const scene = new Scene();
        scene.initMapBox(mapHash);
      });
  }

  // @TODO: move that outside so we don't need to call window.app.navigateTo
  /**
  * @param {string} url - The URL to navigate to.
  * @param {Object} state - State object to associate with the history entry.
  * @param {Object} options
  * @param {boolean} options.replace - If true, the new state/url will replace the current state in browser history
  */
  navigateTo(url, state = {}, { replace = false } = {}) {
    const urlWithCurrentHash = joinPath([window.baseUrl, url]) + location.hash;
    if (replace) {
      window.history.replaceState(state, null, urlWithCurrentHash);
    } else {
      window.history.pushState(state, null, urlWithCurrentHash);
    }
    this.router.routeUrl(urlWithCurrentHash, state);
  }

  updateHash(hash) {
    const urlWithoutHash = window.location.href.split('#')[0];
    window.history.replaceState(window.history.state, null, `${urlWithoutHash}#${hash}`);
  }

  /**
   * Go to the previous application state using history.back()
   * If we determine history.back would exit the application, use replaceState as a fallback.
   * @param {Object} fallback
   * @param {String} fallback.relativeUrl - The relativeUrl to fallback to if history.back is unavailable
   * @param {Object} fallback.state - The state to fallback to if history.back is unavailable
   */
  navigateBack({ relativeUrl = '/', state = {} }) {
    if (history.state !== null) {
      window.history.back();
    } else {
      // Fallback to search params
      this.navigateTo(relativeUrl, state, { replaceState: true });
    }
  }
}
