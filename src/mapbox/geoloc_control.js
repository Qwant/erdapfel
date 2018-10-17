const { GeolocateControl } = require('mapbox-gl--ENV')

let supportsGeolocation;

function checkGeolocationSupport(callback) {
  if (supportsGeolocation !== undefined) {
    callback(supportsGeolocation)
  } else if (window.navigator.permissions !== undefined) {
    window.navigator.permissions.query({ name: 'geolocation' }).then((p) => {
      supportsGeolocation = p.state !== 'denied'
      callback(supportsGeolocation)
    })
  } else {
    supportsGeolocation = !!window.navigator.geolocation
    callback(supportsGeolocation)
  }
}

/**
* Override default control to pass a container
* in constructor and register a onReady cb
*/
class GeolocControl extends GeolocateControl {
  constructor(options, container) {
    super(options)
    this._container = container
  }

  onAdd(map) {
    this._map = map
    checkGeolocationSupport(this._setupUI)
    return this._container
  }

  onReady(cb) {
    this._onReady = cb
  }

  _setupUI(supported) {
    super._setupUI(supported)
    this._onReady()
  }
}

module.exports = GeolocControl
