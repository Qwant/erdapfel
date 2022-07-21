import React from 'react';
import * as Geolocation from '../libs/geolocation';
import Telemetry from '../libs/telemetry';
import { openPendingGeolocateModal } from 'src/modals/GeolocationModal';
import * as store from 'src/adapters/store';
import renderStaticReact from 'src/libs/renderStaticReact';
import { IconGeoloc } from 'src/components/ui/icons';
import { isMobileDevice } from 'src/libs/device';

import { GeolocateControl } from 'mapbox-gl';

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
    if (
      state === Geolocation.geolocationPermissions.PROMPT &&
      !store.get('has_geolocate_modal_opened_once')
    ) {
      await openPendingGeolocateModal();
      store.set('has_geolocate_modal_opened_once', true);
    }
    super.trigger();
  }

  _setupUI(supported) {
    super._setupUI(supported);
    if (this._geolocateButton?.firstChild) {
      this._geolocateButton.firstChild.innerHTML = renderStaticReact(
        <IconGeoloc fill="currentColor" width={isMobileDevice() ? 24 : 16} />
      );
    }
    this._onReady();
  }

  _onError(error) {
    Geolocation.handleError(error);
    super._onError(error);
    // MapboxGL implementation disables the button after an error,
    // but we won't the user to always have feedback with relevant links
    // so override this behavior
    this._geolocateButton.disabled = false;
  }
}
