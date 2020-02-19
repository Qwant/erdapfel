/* global _ */

import Poi from '../poi';
import GeolocationCheck from 'src/libs/geolocation';
export const GEOLOCALISATION_NAME = 'geolocalisation';

import React from 'react';

export const navigatorGeolocationStatus = {
  PENDING: 'pending',
  FOUND: 'found',
  UNKNOWN: 'unknown',
  FORBIDDEN: 'forbidden',
};

export default class NavigatorGeolocalisationPoi extends Poi {
  constructor() {
    super(GEOLOCALISATION_NAME, _('Your position', 'direction'));
    this.status = navigatorGeolocationStatus.UNKNOWN;
  }

  static getInstance() {
    if (!window.__navigatorGeolocalisationPoi) {
      window.__navigatorGeolocalisationPoi = new NavigatorGeolocalisationPoi();
    }
    return window.__navigatorGeolocalisationPoi;
  }

  async geolocate() {
    await GeolocationCheck.checkPrompt();
    return new Promise((resolve, reject) => {
      this.status = navigatorGeolocationStatus.PENDING;
      navigator.geolocation.getCurrentPosition(position => {
        this.setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
        resolve();
      }, error => {
        if (error.code === 1) {
          this.status = navigatorGeolocationStatus.FORBIDDEN;
        }
        GeolocationCheck.handleError(error);
        reject(error);
      });
    });
  }

  setPosition(latLng) {
    this.status = navigatorGeolocationStatus.FOUND;
    this.latLon = latLng;
  }

  render() {
    return (
      <div data-id={GEOLOCALISATION_NAME} data-val={_('Your position', 'direction')}
        className="autocomplete_suggestion itinerary_suggest_your_position">
        <div className="itinerary_suggest_your_position_icon icon-pin_geoloc"></div>
        {_('Your position', 'direction')}
      </div>
    );
  }
}
