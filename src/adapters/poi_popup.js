import {Popup} from 'mapbox-gl--ENV';
import OsmSchedule from '../../src/adapters/osm_schedule';
import IconManager from './icon_manager';
import ExtendedString from '../libs/string';
import ApiPoi from './poi/idunn_poi';
import Device from '../libs/device';
import SceneState from './scene_state';
import poiSubClass from '../mapbox/poi_subclass';
import popupTemplate from '../views/popup.dot';
import poiConfigs from '../../config/constants.yml';

const WAIT_BEFORE_DISPLAY = 350;

function PoiPopup() {}

PoiPopup.prototype.init = function(map) {
  this.map = map;
  this.popupHandle = null;
  this.timeOutHandler = null;
  this.sceneState = SceneState.getSceneState();

  listen('open_popup', (poi, e) => {
    if (Device.isMobile() || isTouchEvent(e)) {
      return;
    }
    this.createPJPopup(poi, e);
  });
  listen('close_popup', () => this.close());

};

PoiPopup.prototype.addListener = function(layer) {
  this.map.on('mouseenter', layer, e => {
    if (Device.isMobile() || isTouchEvent(e)) {
      return;
    }
    this.timeOutHandler = setTimeout(() => {
      let poi = e.features[0];
      if (this.sceneState.isDisplayed(poi.properties.global_id)) {
        return;
      }
      this.createOSMPopup(poi, e.originalEvent);
    }, WAIT_BEFORE_DISPLAY);
  });

  this.map.on('mouseleave', layer, async() => {
    if (this.popupHandle) {
      this.popupHandle.remove();
    }
    clearTimeout(this.timeOutHandler);
  });
};

PoiPopup.prototype.createOSMPopup = async function(layerPoi, event) {
  let poi = await ApiPoi.poiApiLoad(layerPoi.properties.global_id, {simple: true});
  if (poi) {
    this.showPopup(poi, event);
  }
};

PoiPopup.prototype.createPJPopup = function(poi, event) {
  if (poi) {
    this.showPopup(poi, event);
  }
};

PoiPopup.prototype.showPopup = function(poi, event) {
  if (this.popupHandle) {
    this.popupHandle.remove();
    this.popupHandle = null;
  }
  let {color} = IconManager.get(poi);
  let category = poiSubClass(poi.subClassName);
  const reviews = poi.blocksByType.grades;
  const hours = poi.blocksByType.opening_hours;

  let timeMessages = poiConfigs.pois.find(poiConfig => {
    return poiConfig.apiName === 'opening_hours';
  });
  let opening;
  let address;
  if (!reviews && hours) {
    opening = new OsmSchedule(hours, timeMessages.options.messages);
  }
  if (poi.address) {
    address = poi.address.label;
  }

  let popupOptions = {
    className: 'poi_popup__container',
    closeButton: false,
    closeOnClick: true,
    maxWidth: 'none',
    offset: 18, //px
  };

  this.setPopupPosition(event, popupOptions);
  let htmlEncode = ExtendedString.htmlEncode;

  this.popupHandle = new Popup(popupOptions)
    .setLngLat(poi.getLngLat())
    .setHTML(popupTemplate.call({poi, color, opening, address, reviews, category, htmlEncode}))
    .addTo(this.map);
};

PoiPopup.prototype.setPopupPosition = function(event, popupOptions) {
  const VERTICAL_OFFSET = 250;
  const HORIZONTAL_OFFSET = 300;
  const canvasWidth = window.innerWidth;
  const positionFragments = [];

  if (event) {
    if (event.clientY > VERTICAL_OFFSET) {
      positionFragments.push('bottom');
    } else {
      positionFragments.push('top');
    }

    if (event.clientX < canvasWidth - HORIZONTAL_OFFSET) {
      positionFragments.push('left');
    } else {
      positionFragments.push('right');
    }
  } else {
    positionFragments.push('bottom');
    positionFragments.push('left');
  }

  popupOptions.anchor = positionFragments.join('-');
};

PoiPopup.prototype.close = function() {
  if (this.popupHandle) {
    this.popupHandle.remove();
  }
};

/* private */
function isTouchEvent(event) {
  if (event && event.originalEvent && event.originalEvent.sourceCapabilities) {
    return event.originalEvent.sourceCapabilities.firesTouchEvents === true;
  }
  return false;
}

export default PoiPopup;
