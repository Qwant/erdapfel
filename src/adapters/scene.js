import {Map, Marker, LngLat, setRTLTextPlugin} from 'mapbox-gl--ENV'
import PoiPopup from './poi_popup'
import MobileCompassControl from "../mapbox/mobile_compass_control"
import ExtendedControl from "../mapbox/extended_nav_control"
import PanelManager from "../proxies/panel_manager"
import UrlState from "../proxies/url_state"
import {map, layout} from '../../config/constants.yml'
import loadImage from '../libs/image_loader'
import nconf from "../../local_modules/nconf_getter"
import MapPoi from "./poi/map_poi";
import HotLoadPoi from "./poi/hotload_poi";
import Store from '../adapters/store'
import getStyle from "./scene_config";
import SceneState from "./scene_state";
import MapDirection from './map_direction'
import SceneDirection from './scene_direction'
import DirectionPoi from "./poi/specials/direction_poi";
import UrlShards from "../proxies/url_shards";

const performanceEnabled = nconf.get().performance.enabled
const baseUrl = nconf.get().system.baseUrl

const store = new Store()

function Scene() {
  UrlState.registerHash(this, 'map')
  this.currentMarker = null
  this.popup = new PoiPopup()
  this.zoom = map.zoom
  this.center = [map.center.lng, map.center.lat]
  this.sceneState = SceneState.getSceneState()
}

Scene.prototype.initScene = async function () {
  await this.setupInitialPosition()
  this.initMapBox()
}

Scene.prototype.setupInitialPosition = async function () {
  if (window.hotLoadPoi) {
    let hotloadedPoi = new HotLoadPoi()
    this.zoom = hotloadedPoi.zoom
    this.center = [hotloadedPoi.getLngLat().lng, hotloadedPoi.getLngLat().lat]
  } else if(this.urlCenter && this.urlZoom) {
    this.zoom = this.urlZoom
    this.center = this.urlCenter
  } else {
    let lastLocation = await store.getLastLocation()
    if (lastLocation) {
      this.center = [lastLocation.lng, lastLocation.lat]
      this.zoom = lastLocation.zoom
    }
  }
}

Scene.prototype.initMapBox = function () {
  this.mb = new Map({
    attributionControl: false,
    container: 'scene_container',
    style:  getStyle(),
    zoom: this.zoom,
    center: this.center,
    hash: false
  })
  this.popup.init(this.mb)

  setRTLTextPlugin(`${baseUrl}statics/build/javascript/map_plugins/mapbox-gl-rtl-text.js`);

  window.map = {
    center : () => {
      return this.mb.getCenter()
    },
    bbox : () => {
      return this.mb.getBounds()
    }
  }

  const interactiveLayers =  ['poi-level-1', 'poi-level-2', 'poi-level-3']

  this.mb.on('load', () => {
    this.onHashChange()
    new SceneDirection(this.mb)
    new MapDirection(this)

    if(performanceEnabled) {
      window.times.mapLoaded = Date.now()
    }

    const extendedControl = new ExtendedControl()
    const mobileCompassControl = new MobileCompassControl()

    this.mb.addControl(extendedControl, 'bottom-right')
    this.mb.addControl(mobileCompassControl, 'top-right')

    interactiveLayers.forEach((interactiveLayer) => {
      this.mb.on('mouseenter', interactiveLayer, () => {
        this.mb.getCanvas().style.cursor = 'pointer';
      })

      this.mb.on('mouseleave', interactiveLayer, () =>{
        this.mb.getCanvas().style.cursor = '';
      })

      this.mb.on('click', interactiveLayer, async (e) => {
        if(e.features && e.features.length > 0) {
          let mapPoi = new MapPoi(e.features[0], e.lngLat)
          this.sceneState.setPoiId(mapPoi.id)
          if(e.originalEvent.clientX < (layout.sizes.sideBarWidth + layout.sizes.panelWidth) && window.innerWidth > layout.mobile.breakPoint) {
            this.mb.flyTo({center : mapPoi.getLngLat(), offset : [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0]})
          }
          let poi = await PanelManager.loadPoiById(mapPoi.id)
          if(poi) {
            this.addMarker(poi)
          }
        }
      })

      this.popup.addListener(interactiveLayer)
    })

    this.mb.on('moveend', () => {
      UrlState.replaceUrl()
      let lng = this.mb.getCenter().lng
      let lat = this.mb.getCenter().lat
      let zoom = this.mb.getZoom()
      fire('store_center', { lng, lat, zoom })
    })

    window.execOnMapLoaded = (f) => f()
    fire('map_loaded')
  })

  listen('fit_map', (poi, options) => {
    this.fitMap(poi, options)
  })

  listen('fit_bbox', (bbox, padding) => {
    this.fitBbox(bbox, padding)
  })

  listen('map_reset', () => {
    this.mb.jumpTo({center : [map.center.lng, map.center.lat], zoom : map.zoom})
  })

  listen('map_mark_poi', (poi) => {
    this.addMarker(poi)
  })
}

Scene.prototype.isPointInBounds = function(point, bounds) {
  var lng = (point.lng - bounds._ne.lng) * (point.lng - bounds._sw.lng) < 0;
  var lat = (point.lat - bounds._ne.lat) * (point.lat - bounds._sw.lat) < 0;
  return lng && lat;
}

Scene.prototype.isBBoxInExtendedViewport = function(bbox){

  // Get viewport bounds
  var viewport = this.mb.getBounds();

  // Compute "width", "height"
  var width = viewport._ne.lng - viewport._sw.lng;
  var height = viewport._ne.lat - viewport._sw.lat;

  // Compute extended viewport
  viewport._ne.lng += width;
  viewport._ne.lat += height;

  viewport._sw.lng -= width;
  viewport._sw.lat -= height;

  // Check bounds:

  // Lng between -180 and 180 (wraps: 180 + 1 = -179)
  if(viewport._ne.lng < 180) viewport._ne.lng += 360;
  if(viewport._ne.lng > 180) viewport._ne.lng -= 360;

  if(viewport._sw.lng < 180) viewport._sw.lng += 360;
  if(viewport._sw.lng > 180) viewport._sw.lng -= 360;

  // Lat between -85 and 85 (does not wrap)
  if(viewport._ne.lat < -85) viewport._ne.lat = -85;
  if(viewport._ne.lat > 85) viewport._ne.lat = 85;

  if(viewport._sw.lat < -85) viewport._sw.lat = -85;
  if(viewport._sw.lat > 85) viewport._sw.lat = 85;


  // Check if one corner of the BBox is in the extended viewport:

  if(
      this.isPointInBounds(bbox._ne, viewport) // ne
      || this.isPointInBounds({lng: bbox._sw.lng, lat: bbox._ne.lat}, viewport) // nw
      || this.isPointInBounds({lng: bbox._ne.lng, lat: bbox._sw.lat}, viewport) // se
      || this.isPointInBounds(bbox._sw, viewport) // sw
  ){
    return true
  }

  return false
}

Scene.prototype.fitBbox = function(bbox, padding){

  padding = padding || {left: 0, top: 0, right: 0, bottom: 0};

  // Animate if the zoom is big enough and if the BBox is (partially or fully) in the extended viewport
  var animate = false;

  if(this.mb.getZoom() > 10 && this.isBBoxInExtendedViewport(bbox)){
    animate = true;
  }

  this.mb.fitBounds(bbox, {padding : padding, animate: animate})

}



Scene.prototype.fitMap = function(poi, options = {}) {
  const MIN_ZOOM_FLYTO = 10

  if(poi.bbox) {
    let padding =  {top: layout.sizes.topBarHeight + 10, bottom: 10,left: layout.sizes.sideBarWidth + 10, right: 10}
    if(options.sidePanelOffset && window.innerWidth > layout.mobile.breakPoint) {
      padding.left += layout.sizes.panelWidth
    }
    if(this.mb.getZoom() > MIN_ZOOM_FLYTO && this.isWindowedPoi(poi)) {
      this.mb.fitBounds(poi.bbox, {padding : padding})
    } else {
      this.mb.fitBounds(poi.bbox, {padding : padding, animate : false})
    }
  } else {
    let flyOptions = {center : poi.getLngLat(), screenSpeed: 1.5, animate:false}
    if(poi.zoom) {
      flyOptions.zoom = poi.zoom
    }
    // set offset for poi witch will open panel on desktop
    if(options.sidePanelOffset && window.innerWidth > layout.mobile.breakPoint) {
      flyOptions.offset = [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0]
    }

    if(this.mb.getZoom() > MIN_ZOOM_FLYTO && this.isWindowedPoi(poi)) {
      flyOptions.animate = true
    }
    this.mb.flyTo(flyOptions)
  }
}

Scene.prototype.addMarker = async function(poi) {
  if(this.currentMarker !== null) {
    this.currentMarker.remove()
  }
  let image = await loadImage(`${baseUrl}statics/images/map/pin_map.svg`)
  let marker = new Marker({element : image, anchor : 'bottom'})
    .setLngLat(poi.getLngLat())
    .addTo(this.mb)
  this.currentMarker = marker
  return marker
}

/* UrlState interface implementation */
Scene.prototype.store = function () {
  return `${this.mb.getZoom().toFixed(2)}/${this.mb.getCenter().lat.toFixed(7)}/${this.mb.getCenter().lng.toFixed(7)}`
}

Scene.prototype.restore = function (urlShard) {
  let geoCenter = urlShard.match(/(\d*[.]?\d+)\/(-?\d*[.]?\d+)\/(-?\d*[.]?\d+)/)
  if(geoCenter) {
    const ZOOM_INDEX = 1
    const LAT_INDEX = 2
    const LNG_INDEX = 3
    this.urlZoom = parseFloat(geoCenter[ZOOM_INDEX])
    this.urlCenter = [parseFloat(geoCenter[LNG_INDEX]), parseFloat(geoCenter[LAT_INDEX])]
  }
}

Scene.prototype.isWindowedPoi = function(poi) {
  let windowBounds = this.mb.getBounds()
  /* simple way to clone value */
  const originalWindowBounds = windowBounds.toArray()
  if(poi instanceof DirectionPoi) {
    windowBounds.extend(poi.bbox.getCenter())
    return compareBoundsArray(windowBounds.toArray(), originalWindowBounds)
  } else {
    let poiCenter = new LngLat(poi.getLngLat().lng, poi.getLngLat().lat)
    windowBounds.extend(poiCenter)
    return compareBoundsArray(windowBounds.toArray(), originalWindowBounds)
  }
}

Scene.prototype.onHashChange = function () {
  window.onhashchange = () => {
    let shards = UrlShards.parseUrl()
    shards.forEach((shard) => {
      if(shard.prefix === 'map') {
        this.restore(shard.value)
        this.mb.jumpTo({center : this.urlCenter, zoom : this.urlZoom})
      }
    })
  }
}

/* private */

function compareBoundsArray(boundsA, boundsB) {
  return boundsA[0][0] === boundsB[0][0] && boundsA[0][1] === boundsB[0][1] && boundsA[1][0] === boundsB[1][0] && boundsA[1][1] === boundsB[1][1]
}

export default Scene
