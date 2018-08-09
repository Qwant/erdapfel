import {Map, Marker, LngLat} from 'mapbox-gl--ENV'
import ExtendedControl from "../mapbox/extended_nav_control"
import qwantStyle from '@qwant/qwant-basic-gl-style/style.json'
import Poi from "../mapbox/poi"
import StyleLaundry from '../mapbox/style_laundry'
import PanelManager from "../proxies/panel_manager"
import UrlState from "../proxies/url_state"
import {map, layout} from '../../config/constants.yml'

function Scene() {
  UrlState.registerHash(this, 'map')
  this.zoom = map.zoom
  this.center = [map.center.lng, map.center.lat]
  this.currentMarker = null
}

Scene.prototype.initMapBox = function () {
  this.mb = new Map({
    container: 'scene_container',
    style: StyleLaundry(qwantStyle),
    zoom: this.zoom,
    center: this.center,
    hash: false
  })

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
    const extendedControl = new ExtendedControl()

    this.mb.addControl(extendedControl, 'bottom-right')

    interactiveLayers.forEach((interactiveLayer) => {
      this.mb.on('mouseenter', interactiveLayer, () => {
        this.mb.getCanvas().style.cursor = 'pointer';
      })

      this.mb.on('mouseleave', interactiveLayer, () =>{
        this.mb.getCanvas().style.cursor = '';
      })

      this.mb.on('click', interactiveLayer, async (e) => {
        if(e.features && e.features.length > 0) {
          let mapPoi = Poi.mapLoad(e.features[0], e.lngLat)
          if(e.originalEvent.clientX < (layout.sizes.sideBarWidth + layout.sizes.panelWidth) && window.innerWidth > layout.mobile.breakPoint) {
            this.mb.flyTo({center : mapPoi.getLngLat(), offset : [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0]})
          }
          let poi = await PanelManager.loadPoiById(mapPoi.id)
          if(poi) {
            this.addMarker(poi)
          }
        }
      })
    })

    this.mb.on('moveend', () => {
      UrlState.replaceUrl()
    })
  })

  listen('fit_map', (poi, options) => {
    this.fitMap(poi, options)
  })

  listen('map_reset', () => {
    this.mb.jumpTo({center : [map.center.lng, map.center.lat], zoom : map.zoom})
  })

  listen('map_mark_poi', (poi) => {
    this.addMarker(poi)
  })
}

Scene.prototype.fitMap = function(poi, options = {}) {
  if(poi.bbox) {
    let padding =  {top: layout.sizes.topBarHeight + 10, bottom: 10,left: layout.sizes.sideBarWidth + 10, right: 10}
    if(options.sidePanelOffset && window.innerWidth > layout.mobile.breakPoint) {
      padding.left += layout.sizes.panelWidth
    }
    if(this.isWindowedPoi(poi)) {
      this.mb.fitBounds(poi.bbox, {padding : padding})
    } else {
      this.mb.fitBounds(poi.bbox, {padding : padding, animate : false})
    }
  } else {
    let flyOptions = {center : poi.getLngLat(), duration : 0}
    if(poi.zoom) {
      flyOptions.zoom = poi.zoom
    }
    /* set offset for poi witch will open panel on desktop */
    if(options.sidePanelOffset && window.innerWidth > layout.mobile.breakPoint) {
      flyOptions.offset = [(layout.sizes.panelWidth + layout.sizes.sideBarWidth) / 2, 0]
    }

    if(this.isWindowedPoi(poi)) {
      flyOptions.duration = 1500
    }
    this.mb.flyTo(flyOptions)
  }
}

Scene.prototype.addMarker = function(poi) {
  if(this.currentMarker !== null) {
    this.currentMarker.remove()
  }
  let marker = new Marker()
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
    this.zoom = parseFloat(geoCenter[ZOOM_INDEX])
    this.center = [parseFloat(geoCenter[LNG_INDEX]), parseFloat(geoCenter[LAT_INDEX])]
  }
}

Scene.prototype.isWindowedPoi = function(poi) {
  let windowBounds = this.mb.getBounds()
  /* simple way to clone value */
  const originalWindowBounds = windowBounds.toArray()
  let poiCenter = new LngLat(poi.getLngLat().lng, poi.getLngLat().lat)
  windowBounds.extend(poiCenter)
  return compareBoundsArray(windowBounds.toArray(), originalWindowBounds)
}

/* private */
function compareBoundsArray(boundsA, boundsB) {
  return boundsA[0][0] === boundsB[0][0] && boundsA[0][1] === boundsB[0][1] && boundsA[1][0] === boundsB[1][0] && boundsA[1][1] === boundsB[1][1]
}

export default Scene
