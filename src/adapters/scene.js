import { Map, Marker, LngLat, setRTLTextPlugin, LngLatBounds } from 'mapbox-gl--ENV';
import PoiPopup from './poi_popup';
import MobileCompassControl from '../mapbox/mobile_compass_control';
import ExtendedControl from '../mapbox/extended_nav_control';
import { map, layout } from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';
import MapPoi from './poi/map_poi';
import LocalStore from '../libs/local_store';
import getStyle from './scene_config';
import SceneDirection from './scene_direction';
import SceneCategory from './scene_category';
import SceneEvent from './scene_event';
import { createIcon } from '../adapters/icon_manager';
import LatLonPoi from './poi/latlon_poi';
import SceneEasterEgg from './scene_easter_egg';
import Device from '../libs/device';
import { parseMapHash, getMapHash } from 'src/libs/url_utils';
import { toUrl } from 'src/libs/pois';

const baseUrl = nconf.get().system.baseUrl;
const easterEggsEnabled = nconf.get().app.easterEggs;

const store = new LocalStore();

function Scene() {
  this.currentMarker = null;
  this.popup = new PoiPopup();
  this.zoom = map.zoom;
  this.center = [map.center.lng, map.center.lat];
  this.savedLocation = null;
}

Scene.prototype.initScene = async function(locationHash) {
  await this.setupInitialPosition(locationHash);
  this.initMapBox();
};

Scene.prototype.setupInitialPosition = async function(locationHash) {
  if (locationHash) {
    this.zoom = locationHash.zoom;
    this.center = [locationHash.lng, locationHash.lat];
  } else {
    const lastLocation = await store.getLastLocation();
    if (lastLocation) {
      this.center = [lastLocation.lng, lastLocation.lat];
      this.zoom = lastLocation.zoom;
    }
  }
};

Scene.prototype.initMapBox = function() {
  this.mb = new Map({
    attributionControl: false,
    container: 'scene_container',
    style: getStyle(),
    zoom: this.zoom,
    center: this.center,
    hash: false,
    maxZoom: 20,
  });

  this.popup.init(this.mb);

  setRTLTextPlugin(`${baseUrl}statics/build/javascript/map_plugins/mapbox-gl-rtl-text.js`);

  window.map = { mb: this.mb };

  const interactiveLayers = [
    'poi-level-1',
    'poi-level-2',
    'poi-level-3',
    'poi-level-public-transports-1',
    'poi-level-public-transports-2',
  ];

  this.mb.on('load', () => {
    this.onHashChange();
    new SceneDirection(this.mb);
    listen('set_route', () => {
      this.routeDisplayed = true;
    });
    listen('clean_route', () => {
      this.routeDisplayed = false;
    });
    new SceneCategory(this.mb);
    new SceneEvent(this.mb);

    this.mb.addControl(new ExtendedControl(), 'bottom-right');
    this.mb.addControl(new MobileCompassControl(), 'top-right');

    interactiveLayers.forEach(interactiveLayer => {
      this.mb.on('mouseenter', interactiveLayer, () => {
        this.mb.getCanvas().style.cursor = 'pointer';
      });

      this.mb.on('mouseleave', interactiveLayer, () => {
        this.mb.getCanvas().style.cursor = '';
      });

      this.mb.on('click', interactiveLayer, async e => {
        e._interactiveClick = true;
        if (e.features && e.features.length > 0) {
          const mapPoi = new MapPoi(e.features[0]);
          window.app.navigateTo(`/place/${toUrl(mapPoi)}`, { poi: mapPoi.serialize() });
        }
      });

      this.popup.addListener(interactiveLayer);
    });

    this.mb.on('click', e => {
      if (!e._interactiveClick && Device.isMobile()
          && !document.querySelector('.directions-open')) {
        window.app.navigateTo('/');
      }
      // Disable POI anywhere feature on mobile until we opt for an adapted UX
      if (Device.isMobile() || e._interactiveClick || this.routeDisplayed) {
        return;
      }
      const poi = new LatLonPoi(e.lngLat);
      window.app.navigateTo(`/place/${toUrl(poi)}`, { poi });
    });

    this.mb.on('moveend', () => {
      const { lng, lat } = this.mb.getCenter();
      const zoom = this.mb.getZoom();
      store.setLastLocation({ lng, lat, zoom });
      window.app.updateHash(this.getLocationHash());
      fire('map_moveend');
    });

    /* Easter egg for beta */
    if (easterEggsEnabled) {
      SceneEasterEgg.enableEggs(this.mb);
    }

    window.execOnMapLoaded = f => f();
    fire('map_loaded');
  });

  listen('fit_map', (item, padding) => {
    this.fitMap(item, padding);
  });

  listen('map_mark_poi', (poi, options) => {
    this.ensureMarkerIsVisible(poi, options);
    if (!options.isFromCategory) {
      this.addMarker(poi, options);
    }
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
};

Scene.prototype.saveLocation = function() {
  this.savedLocation = this.getLocationHash();
};

Scene.prototype.restoreLocation = function() {
  if (this.savedLocation) {
    const { zoom, lat, lng } = parseMapHash(this.savedLocation);
    const flyOptions = {
      center: [ lng, lat ],
      zoom,
      animate: true,
      screenSpeed: 2,
    };
    this.mb.flyTo(flyOptions);
  }
};

Scene.prototype.isPointInBounds = function(point, bounds) {
  const lng = (point.lng - bounds._ne.lng) * (point.lng - bounds._sw.lng) < 0;
  const lat = (point.lat - bounds._ne.lat) * (point.lat - bounds._sw.lat) < 0;
  return lng && lat;
};

Scene.prototype.isBBoxInExtendedViewport = function(bbox) {

  // Get viewport bounds
  const viewport = this.mb.getBounds();

  // Compute "width", "height"
  const width = viewport._ne.lng - viewport._sw.lng;
  const height = viewport._ne.lat - viewport._sw.lat;

  // Compute extended viewport
  viewport._ne.lng += width;
  viewport._ne.lat += height;

  viewport._sw.lng -= width;
  viewport._sw.lat -= height;

  // Check bounds:

  // Lng between -180 and 180 (wraps: 180 + 1 = -179)
  if (viewport._ne.lng < -180) {
    viewport._ne.lng += 360;
  } else if (viewport._ne.lng > 180) {
    viewport._ne.lng -= 360;
  }

  if (viewport._sw.lng < -180) {
    viewport._sw.lng += 360;
  } else if (viewport._sw.lng > 180) {
    viewport._sw.lng -= 360;
  }

  // Lat between -85 and 85 (does not wrap)
  if (viewport._ne.lat < -85) {
    viewport._ne.lat = -85;
  } else if (viewport._ne.lat > 85) {
    viewport._ne.lat = 85;
  }

  if (viewport._sw.lat < -85) {
    viewport._sw.lat = -85;
  } else if (viewport._sw.lat > 85) {
    viewport._sw.lat = 85;
  }


  // Check if one corner of the BBox is in the extended viewport:

  if (
    this.isPointInBounds(bbox._ne, viewport) // ne
      || this.isPointInBounds({ lng: bbox._sw.lng, lat: bbox._ne.lat }, viewport) // nw
      || this.isPointInBounds({ lng: bbox._ne.lng, lat: bbox._sw.lat }, viewport) // se
      || this.isPointInBounds(bbox._sw, viewport) // sw
  ) {
    return true;
  }

  return false;
};

Scene.prototype.fitBbox = function(bbox, padding = { left: 0, top: 0, right: 0, bottom: 0 }) {
  // normalise bbox
  if (bbox instanceof Array) {
    bbox = new LngLatBounds(bbox);
  }

  // Animate if the zoom is big enough and if the BBox is (partially or fully) in
  // the extended viewport.
  const animate = this.mb.getZoom() > 10 && this.isBBoxInExtendedViewport(bbox);
  this.mb.fitBounds(bbox, { padding, animate });
};


Scene.prototype.fitMap = function(item, padding) {
  // BBox
  if (item._ne && item._sw) {
    this.fitBbox(item, padding);
  } else { // PoI
    if (item.bbox) { // poi Bbox
      this.fitBbox(item.bbox, padding);
    } else { // poi center
      const flyOptions = { center: item.latLon, screenSpeed: 1.5, animate: false };
      if (item.zoom) {
        flyOptions.zoom = item.zoom;
      }

      if (padding) {
        flyOptions.offset = [
          (padding.left - padding.right) / 2,
          (padding.top - padding.bottom) / 2,
        ];
      }

      if (this.mb.getZoom() > 10 && this.isWindowedPoi(item)) {
        flyOptions.animate = true;
      }
      this.mb.flyTo(flyOptions);
    }
  }
};

Scene.prototype.ensureMarkerIsVisible = function(poi, options) {
  if (poi.bbox) {
    this.fitBbox(poi.bbox, options.layout);
    return;
  }
  if (!options.centerMap) {
    const { x: leftPixelOffset } = this.mb.project(poi.latLon);
    const isPoiUnderPanel = leftPixelOffset < layout.sizes.sideBarWidth + layout.sizes.panelWidth
      && window.innerWidth > layout.mobile.breakPoint;
    if (this.isWindowedPoi(poi) && !isPoiUnderPanel) {
      return;
    }
  }
  const offset = Device.isMobile()
    ? [0, 0]
    : [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0];
  this.mb.flyTo({
    center: poi.latLon,
    zoom: poi.zoom,
    offset,
    maxDuration: 1200,
  });
};

Scene.prototype.addMarker = function(poi) {
  const type = poi.type;

  // Create a default marker (white circle on red background) when the PoI is clicked.
  // To do so, we don't define class and subclass when we call createIcon.
  const element = createIcon({ class: '', subclass: '', type });
  element.onclick = function(e) {
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

Scene.prototype.cleanMarker = async function() {
  if (this.currentMarker !== null) {
    this.currentMarker.remove();
  }
};

Scene.prototype.isWindowedPoi = function(poi) {
  const windowBounds = this.mb.getBounds();
  /* simple way to clone value */
  const originalWindowBounds = windowBounds.toArray();
  const poiCenter = new LngLat(poi.latLon.lng, poi.latLon.lat);
  windowBounds.extend(poiCenter);
  return compareBoundsArray(windowBounds.toArray(), originalWindowBounds);
};

Scene.prototype.getLocationHash = function() {
  const { lat, lng } = this.mb.getCenter();
  return getMapHash(this.mb.getZoom(), lat, lng);
};

Scene.prototype.restoreFromHash = function(hash, options = {}) {
  const zll = parseMapHash(hash);
  if (!zll) {
    return;
  }
  const { zoom, lat, lng } = zll;
  this.mb.flyTo({ zoom, center: [ lng, lat ], ...options });
};

Scene.prototype.onHashChange = function() {
  window.onhashchange = () => {
    this.restoreFromHash(window.location.hash, { animate: false });
  };
};

Scene.prototype.translateUIControl = function(selector, bottom) {
  const item = document.querySelector(selector);
  if (item) {
    item.style.transform = `translateY(${-bottom}px)` ;
  }
};

Scene.prototype.moveMobileBottomUI = function(bottom = 0) {
  if (Device.isMobile()) {
    const uiControls = [
      '.mapboxgl-ctrl-attrib',
      '.map_control__scale',
      '.mapboxgl-ctrl-geolocate',
      '.direction_shortcut',
    ];
    uiControls.forEach(uiControl => {
      this.translateUIControl(uiControl, bottom);
    });
  }
};

/* private */

function compareBoundsArray(boundsA, boundsB) {
  return boundsA[0][0] === boundsB[0][0] && boundsA[0][1] === boundsB[0][1] &&
         boundsA[1][0] === boundsB[1][0] && boundsA[1][1] === boundsB[1][1];
}

export default Scene;
