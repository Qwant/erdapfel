import React from 'react';
import ReactDOM from 'react-dom';
import { Popup } from 'mapbox-gl--ENV';
import ApiPoi from './poi/idunn_poi';
import { isMobileDevice } from 'src/libs/device';
import ReactPoiPopup from 'src/components/PoiPopup';
import { listen } from 'src/libs/customEvents';

const WAIT_BEFORE_DISPLAY = 350;

function PoiPopup() {}

PoiPopup.prototype.init = function (map) {
  this.map = map;
  this.popupHandle = null;
  this.timeOutHandler = null;
  this.activePoiId = null;

  listen('open_popup', (poi, e) => {
    if (isMobileDevice() || isTouchEvent(e)) {
      return;
    }
    this.createPJPopup(poi, e);
  });
  listen('close_popup', () => this.close());
  listen('map_mark_poi', poi => {
    this.close();
    this.activePoiId = poi.id;
  });
  listen('clean_marker', () => {
    this.close();
    this.activePoiId = null;
  });
};

PoiPopup.prototype.addListener = function (layer) {
  this.map.on('mouseenter', layer, e => {
    if (isMobileDevice() || isTouchEvent(e)) {
      return;
    }
    this.timeOutHandler = setTimeout(() => {
      const poi = e.features[0];
      if (this.activePoiId === poi.properties.global_id) {
        return;
      }
      this.createOSMPopup(poi, e.originalEvent);
    }, WAIT_BEFORE_DISPLAY);
  });

  this.map.on('click', () => {
    this.close();
  });

  this.map.on('mouseleave', layer, async () => {
    clearTimeout(this.timeOutHandler);
  });
};

PoiPopup.prototype.createOSMPopup = async function (layerPoi, event) {
  const poi = await ApiPoi.poiApiLoad({ id: layerPoi.properties.global_id }, { simple: true });
  if (poi) {
    this.showPopup(poi, event);
  }
};

PoiPopup.prototype.createPJPopup = function (poi, event) {
  if (poi) {
    this.showPopup(poi, event);
  }
};

PoiPopup.prototype.showPopup = function (poi, event) {
  this.close();

  const popupOptions = {
    className: 'poi_popup__container',
    closeButton: false,
    maxWidth: 'none',
    offset: 18, //px,
    anchor: this.getPopupAnchor(event),
  };

  this.popupHandle = new Popup(popupOptions)
    .setLngLat(poi.latLon)
    .setHTML('<div class="poi_popup__wrapper"/></div>')
    .addTo(this.map);

  const popup_wrapper = document.querySelector('.poi_popup__wrapper');
  if (popup_wrapper) {
    ReactDOM.render(<ReactPoiPopup poi={poi} />, popup_wrapper);
  }
};

PoiPopup.prototype.getPopupAnchor = function (event) {
  const VERTICAL_OFFSET = 250;
  const HORIZONTAL_OFFSET = 300;
  const canvasWidth = window.innerWidth;
  const anchorFragments = [];

  if (event) {
    if (event.clientY > VERTICAL_OFFSET) {
      anchorFragments.push('bottom');
    } else {
      anchorFragments.push('top');
    }

    if (event.clientX < canvasWidth - HORIZONTAL_OFFSET) {
      anchorFragments.push('left');
    } else {
      anchorFragments.push('right');
    }
  } else {
    anchorFragments.push('bottom');
    anchorFragments.push('left');
  }

  return anchorFragments.join('-');
};

PoiPopup.prototype.close = function () {
  if (this.popupHandle) {
    this.popupHandle.remove();
    this.popupHandle = null;
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
