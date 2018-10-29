const { GeolocateControl } = require('mapbox-gl--ENV')

/**
* Override default GeolocateControl
*/
class ExtendedGeolocateControl extends GeolocateControl {
  constructor(options, container) {
    super(options)
    this._container = container
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
    window.navigator.permissions.query({ name: 'geolocation' }).then(p => {
      if (p.state === 'prompt') {
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
