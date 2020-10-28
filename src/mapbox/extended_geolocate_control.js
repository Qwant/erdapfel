import * as Geolocation from '../libs/geolocation';
import Telemetry from '../libs/telemetry';
import { openPendingGeolocateModal } from 'src/modals/GeolocationModal';

import { GeolocateControl } from 'mapbox-gl--ENV';

/**
* Override default GeolocateControl
*/

export default class ExtendedGeolocateControl extends GeolocateControl {
  constructor(options, container) {
    super(options);
    this._container = container;
    this.on('trackuserlocationstart', () => {
      Telemetry.addOnce(Telemetry.LOCALISE_TRIGGER);
    });
  }

  onAdd(map) {
    this._map = map;
    this._setupUI();
    return this._container;
  }

  onReady(cb) {
    this._onReady = cb;
  }

  async trigger() {
    const state = await Geolocation.getGeolocationPermission();
    if ( state === Geolocation.geolocationPermissions.PROMPT ) {
      const isModalAccepted = await openPendingGeolocateModal();
      if (!isModalAccepted) {
        return;
      }
    }
    super.trigger();
  }

  _setupUI(supported) {
    super._setupUI(supported);
    this._onReady();
  }

  _onError(error) {
    Geolocation.handleError(error);
    super._onError(error);
  }
}
