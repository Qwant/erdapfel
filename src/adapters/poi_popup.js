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
    if(isTouchEvent(e)) {
      return
    }
    this.timeOutHandler = setTimeout(() => {
      let poi = e.features[0]
      this.create(poi, e.originalEvent)
    }, WAIT_BEFORE_DISPLAY)
  })

  this.map.on('mouseleave', layer, async () => {
    clearTimeout(this.timeOutHandler)
  })
}

PoiPopup.prototype.create = async function (layerPoi, event) {
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

    let popupOptions = {className: 'poi_popup__container', closeButton : false, closeOnClick : true}

    this.setPopupPosition(event, popupOptions)


    this.popupHandle = new Popup(popupOptions)
      .setLngLat(poi.getLngLat())
      .setHTML(popupTemplate.call({poi, color, opening, address, category}))
      .addTo(this.map)
  }
}

PoiPopup.prototype.setPopupPosition = function (event, popupOptions) {
  const VERTICAL_OFFSET = 250
  const HORIZONTAL_OFFSET = 300

  let mapCanvas = this.map.getCanvas()
  let positionFragments = []


  if(event.clientY > VERTICAL_OFFSET) {
    positionFragments.push('bottom')
  } else {
    positionFragments.push('top')
  }

  if(event.clientX < (mapCanvas.width - HORIZONTAL_OFFSET)) {
    positionFragments.push('left')
  } else {
    positionFragments.push('right')
  }
  popupOptions.anchor = positionFragments.join('-')
  popupOptions.offset = {
    'bottom-left': [18, -8],
    'bottom-right': [-18, -8],
    'top-left': [18, 8],
    'top-right': [-18, 8],

  }
}

PoiPopup.prototype.close = function () {
  this.popupHandle.remove()
}

/* private */
function isTouchEvent(event) {
  if(event && event.originalEvent && event.originalEvent.sourceCapabilities) {
    return event.originalEvent.sourceCapabilities.firesTouchEvents === true
  }
  return false
}

export default PoiPopup
