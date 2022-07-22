import { ScaleControl } from 'mapbox-gl--ENV';

/**
 * Override default control to pass a container
 * in constructor and register a onReady cb
 */
export default class ExtendedScaleControl extends ScaleControl {
  constructor(options, container) {
    super(options);
    this.parentContainer = container;
  }

  onAdd(map) {
    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-scale map_control__scale';

    this.parentContainer.appendChild(this._container);

    this._map.on('move', this._onMove);
    super._onMove();

    return this.parentContainer;
  }
}
