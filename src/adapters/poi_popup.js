import {Popup} from 'mapbox-gl--ENV'
import {parse, openingStatus} from '../../src/adapters/opening_hour'
import Poi from '../mapbox/poi'
import IconManager from "./icon_manager";
import {nextTransitionTime} from "./opening_hour";
const poiSubClass = require('../mapbox/poi_subclass')
let popupTemplate = require('../views/popup.dot')
const poiConfigs = require('../../config/constants.yml').pois

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
  if(poi) {
    let {color} = IconManager.get(poi)
    let category = poiSubClass(poi.subClassName)
    let hours = poi.blocks.find(block =>
      block.type === 'opening_hours'
    )
    let timeMessages = poiConfigs.find((poiConfig) => {
      return poiConfig.apiName === 'opening_hours'
    })
    let opening
    let nextTransition
    let address
    if(hours) {
      opening = openingStatus(hours.raw, timeMessages.options.messages)
      nextTransition = nextTransitionTime(hours.seconds_before_next_transition, hours.next_transition_datetime,)
    } else if(poi.address){
      address = poi.address.label
    }


    this.popupHandle = new Popup({className: 'poi_popup__container', closeButton : false, closeOnClick : true, offset : {'bottom-left' : [12, -5]}, anchor : 'bottom-left'})
      .setLngLat(poi.getLngLat())
      .setHTML(popupTemplate.call({poi, color, opening, address, category, nextTransition}))
      .addTo(this.map)
  }
}

PoiPopup.prototype.close = function () {
  this.popupHandle.remove()
}

export default PoiPopup

/*
ays
:
[]
is_24_7
:
false
next_transition_datetime
:
"2018-07-19T18:00:00+02:00"
raw
:
"Tu-Su 09:30-18:00; Th 09:30-21:45"
seconds_before_next_transition
:
2392
 */