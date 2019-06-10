import GeolocationCheck from '../libs/geolocation';
import Telemetry from '../libs/telemetry';

import { GeolocateControl } from 'mapbox-gl--ENV';

/**
* Override default GeolocateControl
*/

export default class ExtendedGeolocateControl extends GeolocateControl {
  constructor(options, container) {
    super(options);
    this._container = container;
    this.on('trackuserlocationstart', () => {
      Telemetry.default.addOnce(Telemetry.LOCALISE_TRIGGER);
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

  trigger() {
    GeolocationCheck.default.checkPrompt(() => super.trigger());
  }

  _setupUI(supported) {
    super._setupUI(supported);
    this._onReady();
  }

  _onError(error) {
    GeolocationCheck.default.handleError(error);
    super._onError(error);
  }
}
