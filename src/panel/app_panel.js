import React from 'react';
import ReactDOM from 'react-dom';
import { parseMapHash, parseQueryString } from 'src/libs/url_utils';
import { listen } from 'src/libs/customEvents';
import RootComponent from './RootComponent';
import Telemetry from 'src/libs/telemetry';

export default class App {
  constructor() {
    this.initMap();

    listen('map_loaded', () => {
      window.times.mapLoaded = Date.now();
      Telemetry.add(Telemetry.PERF_MAP_FIRST_RENDER, {
        app_render: window.times.appRendered - window.times.init,
        mapbox_init: window.times.initMapBox - window.times.init,
        map_first_render: window.times.mapLoaded - window.times.initMapBox,
      });
    });

    ReactDOM.render(<RootComponent />, document.querySelector('#react_root'));
  }

  initMap() {
    const mapHash = parseMapHash(window.location.hash);
    const { bbox } = parseQueryString(window.location.search);
    import(/* webpackChunkName: "map" */ '../adapters/scene').then(({ default: Scene }) => {
      const scene = new Scene();
      scene.initMapBox({
        locationHash: mapHash,
        bbox,
      });
    });
  }

  updateHash(hash) {
    const urlWithoutHash = window.location.href.split('#')[0];
    window.history.replaceState(window.history.state, null, `${urlWithoutHash}#${hash}`);
  }
}
