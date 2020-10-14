/* global _ */

import Poi from '../poi';
import * as Geolocation from 'src/libs/geolocation';

export const navigatorGeolocationStatus = {
  PENDING: 'pending',
  FOUND: 'found',
  UNKNOWN: 'unknown',
  FORBIDDEN: 'forbidden',
};

export default class NavigatorGeolocalisationPoi extends Poi {
  constructor() {
    super('geolocalisation', _('Your position', 'direction'));
    this.status = navigatorGeolocationStatus.UNKNOWN;
  }

  static getInstance() {
    if (!window.__navigatorGeolocalisationPoi) {
      window.__navigatorGeolocalisationPoi = new NavigatorGeolocalisationPoi();
    }
    return window.__navigatorGeolocalisationPoi;
  }

  async geolocate(options = { displayErrorModal: true, displayDirectionModalIfNeeded: false }) {
    let requestPosition = true;
    console.log(requestPosition, options);
    if (options.displayDirectionModalIfNeeded) {
      requestPosition = await Geolocation.showGeolocationModalIfNeeded();
    }
    console.log(requestPosition);
    return new Promise((resolve, reject) => {
      this.status = navigatorGeolocationStatus.PENDING;
      if(requestPosition){
        navigator.geolocation.getCurrentPosition(position => {
          this.setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
          resolve();
        }, error => {
          if (error.code === 1) {
            this.status = navigatorGeolocationStatus.FORBIDDEN;
          }

          if (options.displayErrorModal) {
            Geolocation.handleError(error);
          }
          reject(error);
        });
      }
    });
  }

  setPosition(latLng) {
    this.status = navigatorGeolocationStatus.FOUND;
    this.latLon = latLng;
  }
}
