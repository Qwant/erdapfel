/* global _ */

import Poi from '../poi';
import * as Geolocation from 'src/libs/geolocation';
import { isMobileDevice } from 'src/libs/device';

export const navigatorGeolocationStatus = {
  PENDING: 'pending',
  FOUND: 'found',
  UNKNOWN: 'unknown',
  FORBIDDEN: 'forbidden',
};
export default class NavigatorGeolocalisationPoi extends Poi {
  constructor() {
    super('geolocalisation', 'geolocalisation', _('Your position', 'direction'), 'geoloc');
    this.status = navigatorGeolocationStatus.UNKNOWN;
  }

  static getInstance() {
    if (!window.__navigatorGeolocalisationPoi) {
      window.__navigatorGeolocalisationPoi = new NavigatorGeolocalisationPoi();
    }
    return window.__navigatorGeolocalisationPoi;
  }

  async geolocate(options = { displayErrorModal: true }) {
    return new Promise((resolve, reject) => {
      this.status = navigatorGeolocationStatus.PENDING;
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
          resolve();
        },
        error => {
          if (error.code === 1) {
            this.status = navigatorGeolocationStatus.FORBIDDEN;
          }
          if (options.displayErrorModal) {
            Geolocation.handleError(error);
          }
          reject(error);
        },
        {
          timeout: 5000,
          maximumAge: 300000, // five minutes
          enableHighAccuracy: isMobileDevice(),
        }
      );
    });
  }

  setPosition(latLng) {
    this.status = navigatorGeolocationStatus.FOUND;
    this.latLon = latLng;
  }
}
