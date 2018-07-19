import {Popup} from 'mapbox-gl--ENV'
import {parse, openingStatus} from '../../src/adapters/opening_hour'
import Poi from '../mapbox/poi'
import IconManager from "./icon_manager";
const poiSubClass = require('../mapbox/poi_subclass')
let popupTemplate = require('../views/popup.dot')

const WAIT_BEFORE_DISPLAY = 800


function PoiPopup() {}

PoiPopup.prototype.init = function(map) {
  this.map = map
  this.popupHandle = null

  this.timeOutHandler = null
  this.isCounting = false


}

PoiPopup.prototype.addListener = function(layer) {
  this.map.on('mouseenter', layer, async (e) => {
    this.isCounting = true
    this.timeOutHandler = setTimeout(() => {
      let poi = e.features[0]
      this.create(poi)
    }, WAIT_BEFORE_DISPLAY)
  })

  this.map.on('mouseleave', layer, async () => {
    this.isCounting = false
    clearTimeout(this.timeOutHandler)
  })
}

PoiPopup.prototype.create = async function (layerPoi) {
  let poi = await Poi.apiLoad(layerPoi.properties.global_id)
  let className = poiSubClass(poi.subClassName)
  let {color} = IconManager.get(poi.className, poi.subClassName)
  let opening = openingStatus(parse(poi.opening))
    this.popupHandle = new Popup({className: 'poi_popup'})
    .setLngLat(poi.getLngLat())
    .setHTML(popupTemplate.call({poi, className, color, opening}))
    .addTo(this.map)
}

PoiPopup.prototype.close = function () {
  this.popupHandle.remove()
}

export default PoiPopup