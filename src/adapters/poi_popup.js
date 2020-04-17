import React from 'react';
import renderStaticReact from 'src/libs/renderStaticReact';
import { Popup } from 'mapbox-gl--ENV';
import ApiPoi from './poi/idunn_poi';
import { isMobileDevice } from 'src/libs/device';
import ReactPoiPopup from 'src/components/PoiPopup';

const WAIT_BEFORE_DISPLAY = 350;

function PoiPopup() {}

PoiPopup.prototype.init = function(map) {
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

PoiPopup.prototype.addListener = function(layer) {
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

  this.map.on('mouseleave', layer, async () => {
    this.close();
    clearTimeout(this.timeOutHandler);
  });
};

PoiPopup.prototype.createOSMPopup = async function(layerPoi, event) {
  const poi = await ApiPoi.poiApiLoad({ 'id': layerPoi.properties.global_id }, { simple: true });
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
  this.close();

  const popupOptions = {
    className: 'poi_popup__container',
    closeButton: false,
    closeOnClick: true,
    maxWidth: 'none',
    offset: 18, //px,
    anchor: this.getPopupAnchor(event),
  };

  this.popupHandle = new Popup(popupOptions)
    .setLngLat(poi.latLon)
    .setHTML(renderStaticReact(<ReactPoiPopup poi={poi} />))
    .addTo(this.map);
};

PoiPopup.prototype.getPopupAnchor = function(event) {
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

PoiPopup.prototype.close = function() {
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
