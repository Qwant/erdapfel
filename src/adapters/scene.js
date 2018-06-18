import {Map, Marker} from 'mapbox-gl--ENV'
import ExtendedControl from "../mapbox/extended_nav_control"
import qwantStyle from '@qwant/qwant-basic-gl-style/style.json'
import Poi from "../mapbox/poi"
import StyleLaundry from '../mapbox/style_laundry'
import PanelManager from "../proxies/panel_manager"
import UrlState from "../proxies/url_state"

function Scene() {
  UrlState.registerHash(this, 'map')
  this.zoom = 2
  this.center = [20,20]
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

      this.mb.on('click', interactiveLayer, (e) => {
        let poi = Poi.sceneLoad(e, this.mb.getZoom())
        PanelManager.setPoi(poi)
        this.addMarker(poi)
      })
    })

    this.mb.on('moveend', () => {
      UrlState.replaceUrl()
    })
  })

  listen('fly_to', (poi) => {
    this.flyTo(poi)
  })

  listen('fit_bounds', (poi, options) => {
    this.fitBounds(poi, options)
  })

  listen('map_mark_poi', (poi) => {
    this.addMarker(poi)
  })
}

Scene.prototype.flyTo = function (poi) {

  let windowBounds = this.mb.getBounds()
  const originalWindowBounds = windowBounds.toArray() /* simple way to clone value */
  let poiCenter = new mapboxgl.LngLat(poi.getLngLat().lng, poi.getLngLat().lat)
  windowBounds.extend(poiCenter)
  /* flyTo location if it's in the window or else jumpTo */
  let flyOptions = {center : poi.getLngLat()}
  if(compareBoundsArray(windowBounds.toArray(), originalWindowBounds)) {
    if(poi.zoom) {
      flyOptions.zoom = poi.zoom
    }
    this.mb.flyTo(flyOptions)
  } else {
    if(poi.zoom) {
      flyOptions.zoom = poi.zoom - 1
      this.mb.jumpTo(flyOptions)
      this.mb.flyTo({zoom : poi.zoom})
    } else {
      this.mb.jumpTo(flyOptions)
    }
  }
}

Scene.prototype.fitBounds = function (poi) {
  this.mb.fitBounds(poi.bbox, poi.padding)
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
  return `${this.mb.getZoom().toFixed(2)}/${this.mb.getCenter().lng.toFixed(7)}/${this.mb.getCenter().lat.toFixed(7)}`
}

Scene.prototype.restore = function (urlShard) {
  let geoCenter = urlShard.match(/(\d*[.]?\d+)\/(-?\d*[.]?\d+)\/(-?\d*[.]?\d+)/)
  if(geoCenter) {
    this.zoom = parseFloat(geoCenter[1])
    this.center = [parseFloat(geoCenter[2]), parseFloat(geoCenter[3])]
  }
}

/* private */
function compareBoundsArray(boundsA, boundsB) {
  return boundsA[0][0] === boundsB[0][0] && boundsA[0][1] === boundsB[0][1] && boundsA[1][0] === boundsB[1][0] && boundsA[1][1] === boundsB[1][1]
}

export default Scene
