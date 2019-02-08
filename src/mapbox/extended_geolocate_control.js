const GeolocationCheck = require("../libs/geolocation").default
const Telemetry = require('../libs/telemetry').default

const { GeolocateControl } = require('mapbox-gl--ENV')

/**
* Override default GeolocateControl
*/

class ExtendedGeolocateControl extends GeolocateControl {
  constructor(options, container) {
    super(options)
    this._container = container
    this.on('trackuserlocationstart', () => {
      Telemetry.addOnce(Telemetry.LOCALISE_TRIGGER)
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
    GeolocationCheck.checkPrompt()
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
