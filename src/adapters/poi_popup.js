import {Popup} from 'mapbox-gl--ENV'
import Poi from '../mapbox/poi'
let popupTemplate = require('../views/popup.dot')

const WAIT_BEFORE_DISPLAY = 800


function PoiPopup() {}

PoiPopup.prototype.init = function(map, interactiveLayer) {
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
  this.popupHandle = new Popup({className: 'poi_popup'})
    .setLngLat(poi.getLngLat())
    .setHTML(popupTemplate.call(poi))
    .addTo(this.map)
}

PoiPopup.prototype.close = function () {
  this.popupHandle.remove()
}

export default PoiPopup