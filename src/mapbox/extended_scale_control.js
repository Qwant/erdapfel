
const { ScaleControl } = require('mapbox-gl--ENV')

/**
 * Override default control to pass a container
 * in constructor and register a onReady cb
 */
class ExtendedScaleControl extends ScaleControl {
  constructor(options, container) {
    super(options)
    this.parentCcontainer = container
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div')
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-scale map_control__scale'

    this.parentCcontainer.appendChild(this._container);

    this._map.on('move', this._onMove)
    super._onMove();

    return this.parentCcontainer
  }
}

module.exports = ExtendedScaleControl
