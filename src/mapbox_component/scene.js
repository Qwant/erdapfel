import mapboxgl from 'mapbox-gl'
import AdminControl from "../mapbox_controllers/admin_control"
import ExtendedControl from "../mapbox_controllers/extended_nav_control"
import PoiAction from './poi_action'
import qwantStyle from '@qwant/qwant-basic-gl-style/style.json'

function Scene() {
  this.mb = new mapboxgl.Map({
    container: 'scene_container',
    style: qwantStyle,
    zoom: 14,
    center: [2.2900, 48.8719],
    hash: true
  })

  const extendedControl = new ExtendedControl()
  this.mb.addControl(extendedControl, 'bottom-right')

  const adminControl = new AdminControl()
  this.mb.addControl(adminControl, 'top-right')

  new PoiAction(this.mb)
}

Scene.prototype.flyTo = function (center, zoom) {
  this.mb.flyTo({
    center : center,
    zoom : zoom
  })
}

Scene.prototype.fitBounds = function (center, options) {
  this.mb.fitBounds(center, options)
}

export default Scene
