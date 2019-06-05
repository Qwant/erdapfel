import {Popup} from 'mapbox-gl--ENV'
import OsmSchedule from '../../src/adapters/osm_schedule'
import IconManager from "./icon_manager";
import ExtendedString from '../libs/string'
import ApiPoi from "./poi/idunn_poi";
import Device from '../libs/device'
import SceneState from "./scene_state";
const poiSubClass = require('../mapbox/poi_subclass')
let popupTemplate = require('../views/popup.dot')
const poiConfigs = require('../../config/constants.yml').pois

const WAIT_BEFORE_DISPLAY = 350

function PoiPopup() {}



PoiPopup.prototype.init = function(map) {
  this.map = map
  this.popupHandle = null
  this.timeOutHandler = null
  this.sceneState = SceneState.getSceneState()

  listen("open_popup", (poi, e)=>this.createPJPopup(poi, e));
  listen("close_popup", ()=>this.close());

}

PoiPopup.prototype.addListener = function(layer) {
  this.map.on('mouseenter', layer, (e) => {
    if(Device.isMobile() || isTouchEvent(e)) {
      return
    }
    this.timeOutHandler = setTimeout(() => {
      let poi = e.features[0]
      if(this.sceneState.isDisplayed(poi.properties.global_id)) {
        return
      }
      this.createOSMPopup(poi, e.originalEvent)
    }, WAIT_BEFORE_DISPLAY)
  })

  this.map.on('mouseleave', layer, async () => {
    if(this.popupHandle){
      this.popupHandle.remove()
    }
    clearTimeout(this.timeOutHandler)
  })
}

PoiPopup.prototype.createOSMPopup = async function (layerPoi, event) {
  let poi = await ApiPoi.poiApiLoad(layerPoi.properties.global_id, {simple : true})
  if(poi) {
    this.showPopup(poi, event);
  }
}

PoiPopup.prototype.createPJPopup =  function (poi, event) {
  if(poi) {
    this.showPopup(poi, event);
  }
}

PoiPopup.prototype.showPopup = function(poi, event){
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
  let htmlEncode = ExtendedString.htmlEncode

  this.popupHandle = new Popup(popupOptions)
      .setLngLat(poi.getLngLat())
      .setHTML(popupTemplate.call({poi, color, opening, address, category, htmlEncode}))
      .addTo(this.map)
}

PoiPopup.prototype.setPopupPosition = function (event, popupOptions) {
  const VERTICAL_OFFSET = 250
  const HORIZONTAL_OFFSET = 300
  const canvasWidth = window.innerWidth
  const positionFragments = []

  if(event) {
    if (event.clientY > VERTICAL_OFFSET) {
      positionFragments.push('bottom')
    } else {
      positionFragments.push('top')
    }

    if (event.clientX < (canvasWidth - HORIZONTAL_OFFSET)) {
      positionFragments.push('left')
    } else {
      positionFragments.push('right')
    }
  }
  else {
    positionFragments.push('bottom')
    positionFragments.push('left')
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
