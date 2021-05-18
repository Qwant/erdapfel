import { Map, Marker, LngLat, setRTLTextPlugin, LngLatBounds } from 'mapbox-gl--ENV';
import PoiPopup from './poi_popup';
import MobileCompassControl from '../mapbox/mobile_compass_control';
import ExtendedControl from '../mapbox/extended_nav_control';
import { map as mapConfig } from 'config/constants.yml';
import { getCurrentMapPaddings, isPositionUnderUI } from 'src/panel/layouts';
import nconf from '@qwant/nconf-getter';
import MapPoi from './poi/map_poi';
import { getLastLocation, setLastLocation } from 'src/adapters/store';
import getStyle from './scene_config';
import SceneDirection from './scene_direction';
import SceneCategory from './scene_category';
import { createDefaultPin } from '../adapters/icon_manager';
import LatLonPoi from './poi/latlon_poi';
import { isMobileDevice } from 'src/libs/device';
import { parseMapHash, getMapHash } from 'src/libs/url_utils';
import { parseBboxString } from 'src/libs/bounds';
import { toUrl, getBestZoom } from 'src/libs/pois';
import Error from 'src/adapters/error';
import { fire, listen } from 'src/libs/customEvents';
import locale from '../mapbox/locale';
import { setPoiHoverStyle } from 'src/adapters/pois_styles';

const baseUrl = nconf.get().system.baseUrl;
const LONG_TOUCH_DELAY_MS = 500;
const MOBILE_IDLE_DELAY_MS = 2000;
let MOBILE_IDLE_TIMEOUT;

function Scene() {
  this.currentMarker = null;
  this.popup = new PoiPopup();
  this.savedLocation = null;
}

const getPoiView = poi => ({
  center: poi.geometry.center,
  zoom: getBestZoom(poi),
  bounds: poi.geometry.bbox,
});

const hideMobileScale = function () {
  const item = document.querySelector('.map_control__scale');
  if (item) {
    item.classList.add('fadeOut');
  }
};

const showMobileScale = function () {
  const item = document.querySelector('.map_control__scale');
  if (item) {
    item.classList.remove('fadeOut');
  }
};

Scene.prototype.getMapInitOptions = function ({ locationHash, bbox }) {
  if (bbox) {
    try {
      return { bounds: parseBboxString(bbox) };
    } catch (e) {
      console.error(e);
    }
  }
  if (window.hotLoadPoi) {
    return getPoiView(window.hotLoadPoi);
  }
  if (locationHash) {
    return {
      zoom: locationHash.zoom,
      center: [locationHash.lng, locationHash.lat],
    };
  }
  const lastLocation = getLastLocation();
  if (lastLocation) {
    return {
      zoom: lastLocation.zoom,
      center: [lastLocation.lng, lastLocation.lat],
    };
  }
  if (window.initialBbox) {
    return {
      bounds: window.initialBbox,
      fitBoundsOptions: {
        maxZoom: 9,
      },
    };
  }
  return {
    zoom: mapConfig.zoom,
    center: [mapConfig.center.lng, mapConfig.center.lat],
  };
};

Scene.prototype.initMapBox = function ({ locationHash, bbox }) {
  window.times.initMapBox = Date.now();

  setRTLTextPlugin(
    `${baseUrl}statics/build/javascript/map_plugins/mapbox-gl-rtl-text.js`,
    error => {
      if (error) {
        Error.send('scene', 'setRTLTextPlugin', 'Failed to load mapbox RTL plugin', error);
      }
    },
    /* lazy */ true
  );

  this.mb = new Map({
    attributionControl: false,
    container: 'scene_container',
    style: getStyle(),
    hash: false,
    maxZoom: 20,
    locale,
    ...this.getMapInitOptions({ locationHash, bbox }),
  });
  // @MAPBOX: This method isn't implemented by the Mapbox-GL mock
  this.mb.setPadding = this.mb.setPadding || (() => {});
  this.mb.setPadding(getCurrentMapPaddings());

  this.popup.init(this.mb);
  window.map = this;

  const interactiveLayers = [
    'poi-level-1',
    'poi-level-2',
    'poi-level-3',
    'poi-level-public-transports-1',
    'poi-level-public-transports-2',
  ];
  this.hoveredPoi = null;

  // Max time between two touch to be considered a single "double click" event
  // This is the value Mapbox-GL uses, in src/ui/handler/dblclick_zoom.js
  this.DOUBLE_TAP_DELAY_MS = 300;
  this.lastDoubleTapTimeStamp = 0;
  this.lastTouchEndTimeStamp = 0;
  this.mb.on('touchend', _e => {
    const timeStamp = Date.now();
    // maybe we should also check the distance between the two touch events…
    if (timeStamp - this.lastTouchEndTimeStamp < this.DOUBLE_TAP_DELAY_MS) {
      this.lastDoubleTapTimeStamp = timeStamp;
    }
    this.lastTouchEndTimeStamp = timeStamp;
  });

  this.mb.on('load', () => {
    fire('restart_idle_timeout');
    this.onHashChange();
    new SceneDirection(this.mb);
    new SceneCategory(this.mb);

    this.mb.addControl(new ExtendedControl(), 'bottom-right');
    this.mb.addControl(new MobileCompassControl(), 'top-right');

    if (!isMobileDevice()) {
      interactiveLayers.forEach(interactiveLayer => {
        setPoiHoverStyle(this.mb, interactiveLayer);

        this.mb.on('mouseenter', interactiveLayer, e => {
          if (e.features.length > 0) {
            this.hoveredPoi = e.features[0];
            this.mb.setFeatureState(this.hoveredPoi, { hover: true });
          }
          this.mb.getCanvas().style.cursor = 'pointer';
        });

        this.mb.on('mouseleave', interactiveLayer, () => {
          if (this.hoveredPoi) {
            this.mb.setFeatureState(this.hoveredPoi, { hover: false });
            this.hoveredPoi = null;
          }
          this.mb.getCanvas().style.cursor = '';
        });

        this.popup.addListener(interactiveLayer);
      });
    }

    // we have to delay click event resolution to make time for possible double click events,
    // which are thrown *after* two separate click events are thrown
    this.clickDelayHandler = null;

    this.mb.on('click', e => {
      fire('restart_idle_timeout');
      if (e.originalEvent.cancelBubble) {
        return;
      }
      // cancel the previous click handler if it's still pending
      clearTimeout(this.clickDelayHandler);
      // if this is a real mouse double-click, we can simply return here
      if (e.originalEvent.detail >= 2) {
        return;
      }
      const pois = this.mb.queryRenderedFeatures(e.point, { layers: interactiveLayers });
      // when clicking on a POI, just trigger the action without delay,
      // as a subsequent double click isn't a problem
      if (pois[0]) {
        this.clickOnMap(e.lngLat, pois[0]);
        return;
      }
      this.clickDelayHandler = setTimeout(() => {
        // for touch UX we have to make sure a double tap zoom hasn't been made in the meantime
        if (Date.now() - this.lastDoubleTapTimeStamp < this.DOUBLE_TAP_DELAY_MS) {
          return;
        }
        this.clickOnMap(e.lngLat, null);
      }, this.DOUBLE_TAP_DELAY_MS);
    });

    // Long touch polyfill (for mobile devices and touch screens)
    // Custom implementation because the contextmenu event isn't supported by MapBox.
    // Long touch is initiated on touchstart event, and canceled if a move, gesture or touchend occurs before 500ms.
    // Sources:
    // https://stackoverflow.com/a/1943768 (explanation of 500ms delay)
    // https://stackoverflow.com/a/54746189 (polyfill implementation also using the 500ms delay)

    let longTouchTimeout = null;
    this.mb.on('touchstart', e => {
      fire('restart_idle_timeout');
      if (e.originalEvent.touches.length === 1) {
        longTouchTimeout = setTimeout(() => {
          this.clickOnMap(e.lngLat, null, { longTouch: true });
          this.cancelClickAfterLongTouch = true;
        }, LONG_TOUCH_DELAY_MS);
      }
    });

    const longTouchCancellingEvents = [
      'touchend',
      'touchcancel',
      'touchmove',
      'pointerdrag',
      'pointermove',
      'moveend',
      'gesturestart',
      'gesturechange',
      'gestureend',
    ];

    const cancelLongTouch = e => {
      if (longTouchTimeout) {
        clearTimeout(longTouchTimeout);
        longTouchTimeout = null;
      }

      if (this.cancelClickAfterLongTouch) {
        e.originalEvent.preventDefault();
        this.cancelClickAfterLongTouch = false;
      }
    };

    longTouchCancellingEvents.forEach(event => {
      this.mb.on(event, cancelLongTouch);
    });

    this.mb.on('dragstart', () => {
      fire('map_user_interaction');
    });
    this.mb.on('pitchstart', () => {
      fire('map_user_interaction');
    });

    this.mb.on('moveend', () => {
      const { lng, lat } = this.mb.getCenter();
      const zoom = this.mb.getZoom();
      setLastLocation({ lng, lat, zoom });
      window.app.updateHash(this.getLocationHash());
      fire('map_moveend');
    });

    window.execOnMapLoaded = f => f();
    fire('map_loaded');
  });

  listen('fit_map', (item, forceAnimate) => {
    this.fitMap(item, forceAnimate);
  });

  listen('ensure_poi_visible', (poi, options) => {
    this.ensureMarkerIsVisible(poi, options);
  });

  listen('create_poi_marker', poi => {
    this.addMarker(poi);
  });

  listen('clean_marker', () => {
    this.cleanMarker();
  });

  listen('save_location', () => {
    this.saveLocation();
  });

  listen('restore_location', () => {
    this.restoreLocation();
  });

  listen('move_mobile_bottom_ui', bottom => {
    this.moveMobileBottomUI(bottom);
  });

  listen('move_mobile_geolocation_button', bottom => {
    this.moveMobileGeolocationButton(bottom);
  });

  listen('mobile_geolocation_button_visibility', visible => {
    this.mobileButtonVisibility('.mapboxgl-ctrl-geolocate', visible);
  });

  listen('mobile_direction_button_visibility', visible => {
    this.mobileButtonVisibility('.direction_shortcut', visible);
  });

  listen('update_map_paddings', () => {
    this.mb.setPadding(getCurrentMapPaddings());
  });
};

Scene.prototype.clickOnMap = function (lngLat, clickedFeature, { longTouch = false } = {}) {
  // Instantiate the place clicked as a PoI
  const poi = clickedFeature ? new MapPoi(clickedFeature) : new LatLonPoi(lngLat);

  if (document.querySelector('.directions-open')) {
    // If Direction panel is open, tell it to fill its fields with this PoI
    fire('set_direction_point', poi);
  } else if (isMobileDevice() && !clickedFeature && !longTouch) {
    // On mobile, simple clicks anywhere close the currently open panel
    window.app.navigateTo('/');
  } else {
    // Default case: open the POI panel
    window.app.navigateTo(`/place/${toUrl(poi)}`, { poi });
  }
};

Scene.prototype.saveLocation = function () {
  this.savedLocation = this.getLocationHash();
};

Scene.prototype.restoreLocation = function () {
  if (this.savedLocation) {
    const { zoom, lat, lng } = parseMapHash(this.savedLocation);
    const flyOptions = {
      center: [lng, lat],
      zoom,
      animate: true,
      screenSpeed: 2,
    };
    this.mb.flyTo(flyOptions);
  }
};

const clamp = (min, max, value) => Math.min(max, Math.max(min, value));

Scene.prototype.isBBoxInExtendedViewport = function (bbox) {
  const viewport = this.mb.getBounds();

  const width = viewport.getEast() - viewport.getWest();
  const height = viewport.getNorth() - viewport.getSouth();

  // Compute extended viewport, with lats between -85 and 85
  viewport.setNorthEast(
    new LngLat(viewport.getEast() + width, clamp(-85, 85, viewport.getNorth() + height)).wrap()
  );
  viewport.setSouthWest(
    new LngLat(viewport.getWest() - width, clamp(-85, 85, viewport.getSouth() - height)).wrap()
  );

  // Check if the bbox overlaps the viewport
  return (
    viewport.contains(bbox.getNorthWest()) ||
    viewport.contains(bbox.getNorthEast()) ||
    viewport.contains(bbox.getSouthEast()) ||
    viewport.contains(bbox.getSouthWest())
  );
};

Scene.prototype.fitBbox = function (bbox, forceAnimate) {
  // normalise bbox
  if (bbox instanceof Array) {
    bbox = new LngLatBounds(bbox);
  }

  // Animate if the zoom is big enough and if the BBox is (partially or fully) in
  // the extended viewport.
  const animate = forceAnimate || (this.mb.getZoom() > 10 && this.isBBoxInExtendedViewport(bbox));
  this.mb.fitBounds(bbox, { animate });
};

// Move the map to focus on an item
Scene.prototype.fitMap = function (item, forceAnimate) {
  // BBox
  if (item instanceof LngLatBounds || Array.isArray(item)) {
    this.fitBbox(item, forceAnimate);
  } else {
    // PoI
    if (item.bbox) {
      // poi Bbox
      this.fitBbox(item.bbox, forceAnimate);
    } else {
      // poi center
      const flyOptions = {
        center: item.latLon,
        zoom: getBestZoom(item),
        screenSpeed: 1.5,
        animate: false,
      };

      if (forceAnimate || (this.mb.getZoom() > 10 && this.isWindowedPoi(item))) {
        flyOptions.animate = true;
      }
      this.mb.flyTo(flyOptions);
    }
  }
};

Scene.prototype.ensureMarkerIsVisible = function (poi, options) {
  if (poi.bbox) {
    this.fitBbox(poi.bbox);
    return;
  }
  const isMobile = isMobileDevice();
  if (!options.centerMap) {
    const isPoiUnderPanel = isPositionUnderUI(this.mb.project(poi.latLon), { isMobile });
    if (this.isWindowedPoi(poi) && !isPoiUnderPanel) {
      return;
    }
  }
  this.mb.flyTo({
    center: poi.latLon,
    zoom: getBestZoom(poi),
    maxDuration: 1200,
  });
};

Scene.prototype.addMarker = function (poi) {
  const element = createDefaultPin();
  element.onclick = function (e) {
    // click event should not be propagated to the map itself;
    e.stopPropagation();
  };

  if (this.currentMarker !== null) {
    this.currentMarker.remove();
  }

  const marker = new Marker({ element, anchor: 'bottom', offset: [0, -5] })
    .setLngLat(poi.latLon)
    .addTo(this.mb);
  this.currentMarker = marker;
  return marker;
};

Scene.prototype.cleanMarker = async function () {
  if (this.currentMarker !== null) {
    this.currentMarker.remove();
    this.currentMarker = null;
  }
};

Scene.prototype.isWindowedPoi = function (poi) {
  return this.mb.getBounds().contains(new LngLat(poi.latLon.lng, poi.latLon.lat));
};

Scene.prototype.getLocationHash = function () {
  const { lat, lng } = this.mb.getCenter();
  return getMapHash(this.mb.getZoom(), lat, lng);
};

Scene.prototype.restoreFromHash = function (hash, options = {}) {
  const zll = parseMapHash(hash);
  if (!zll) {
    return;
  }
  const { zoom, lat, lng } = zll;
  this.mb.flyTo({ zoom, center: [lng, lat], ...options });
};

Scene.prototype.onHashChange = function () {
  window.onhashchange = () => {
    this.restoreFromHash(window.location.hash, { animate: false });
  };
};

Scene.prototype.translateUIControl = function (selector, bottom) {
  const item = document.querySelector(selector);
  if (item) {
    item.style.transform = `translateY(${-bottom}px)`;
  }
};

Scene.prototype.moveMobileBottomUI = function (bottom = 0) {
  if (!isMobileDevice() && bottom > 0) {
    return;
  }
  const uiControls = [
    '.map_control__scale_attribute_container',
    '.mapboxgl-ctrl-geolocate',
    '.direction_shortcut',
  ];
  uiControls.forEach(uiControl => {
    this.translateUIControl(uiControl, bottom);
  });
};

Scene.prototype.moveMobileGeolocationButton = function (bottom = 0) {
  if (!isMobileDevice() && bottom > 0) {
    return;
  }
  this.translateUIControl('.mapboxgl-ctrl-geolocate', bottom);
};

Scene.prototype.mobileButtonVisibility = function (selector, visible) {
  if (!isMobileDevice()) {
    return;
  }
  const item = document.querySelector(selector);
  if (item) {
    if (visible) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  }
};

listen('restart_idle_timeout', () => {
  // Cancel idle status
  showMobileScale();
  clearTimeout(MOBILE_IDLE_TIMEOUT);

  // Start a new 2s idle timeout
  MOBILE_IDLE_TIMEOUT = setTimeout(() => {
    hideMobileScale();
  }, MOBILE_IDLE_DELAY_MS);
});

export default Scene;
