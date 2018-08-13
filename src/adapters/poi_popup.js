import {Popup} from 'mapbox-gl--ENV'
import OsmSchedule from '../../src/adapters/osm_schedule'
import Poi from '../mapbox/poi'
import IconManager from "./icon_manager";
const poiSubClass = require('../mapbox/poi_subclass')
let popupTemplate = require('../views/popup.dot')
const poiConfigs = require('../../config/constants.yml').pois

const WAIT_BEFORE_DISPLAY = 800


function PoiPopup() {}

PoiPopup.prototype.init = function(map) {
  this.map = map
  this.popupHandle = null

  this.timeOutHandler = null
}

PoiPopup.prototype.addListener = function(layer) {
  this.map.on('mouseenter', layer, (e) => {
    this.timeOutHandler = setTimeout(() => {
      let poi = e.features[0]
      this.create(poi)
    }, WAIT_BEFORE_DISPLAY)
  })

  this.map.on('mouseleave', layer, async () => {
    clearTimeout(this.timeOutHandler)
  })
}

PoiPopup.prototype.create = async function (layerPoi) {
  let poi = await Poi.poiApiLoad(layerPoi.properties.global_id)
  if(poi) {
    if(this.popupHandle) {
      this.popupHandle.remove()
      this.popupHandle = null
    }
    let {color} = IconManager.get(poi)
    let category = poiSubClass(poi.subClassName)
    let hours = poi.blocks.find(block =>
      block.type === 'opening_hours'
    )
    let timeMessages = poiConfigs.find((poiConfig) => {
      return poiConfig.apiName === 'opening_hours'
    })
    let opening
    let address
    if(hours) {
      opening = new OsmSchedule(hours, timeMessages.options.messages)
    } else if(poi.address){
      address = poi.address.label
    }
    this.popupHandle = new Popup({className: 'poi_popup__container', closeButton : false, closeOnClick : true, offset : {'bottom-left' : [18, -8]}, anchor : 'bottom-left'})
      .setLngLat(poi.getLngLat())
      .setHTML(popupTemplate.call({poi, color, opening, address, category}))
      .addTo(this.map)
  }
}

PoiPopup.prototype.close = function () {
  this.popupHandle.remove()
}

export default PoiPopup
