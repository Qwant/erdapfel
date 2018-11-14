const Telemetry = require('../libs/telemetry').default

const { GeolocateControl } = require('mapbox-gl--ENV')

/**
* Override default GeolocateControl
*/

const geolocationPermissions = {
  PROMPT : 'prompt',
  GRANTED : 'granted',
  DENIED : 'denied'
}

class ExtendedGeolocateControl extends GeolocateControl {
  constructor(options, container) {
    super(options)
    this._container = container
    this.on('trackuserlocationstart', () => {
      Telemetry.add(Telemetry.LOCALISE_TRIGGER)
    })
  }

  onAdd(map) {
    this._map = map
    this._setupUI()
    return this._container
  }

  onReady(cb) {
    this._onReady = cb
  }

  trigger() {
    window.navigator.permissions && window.navigator.permissions.query({ name: 'geolocation' }).then(p => {
      if (p.state === geolocationPermissions.PROMPT) {
        fire('open_geolocate_modal')
      }
    })
    super.trigger()

  }

  _setupUI(supported) {
    super._setupUI(supported)
    this._onReady()
  }

  _onError(error) {
    if (error.code === 1) {
      // PERMISSION_DENIED
      fire('open_geolocate_denied_modal')
    }
    super._onError(error)
  }
}

module.exports = ExtendedGeolocateControl
