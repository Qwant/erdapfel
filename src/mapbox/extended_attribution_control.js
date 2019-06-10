import { AttributionControl } from 'mapbox-gl--ENV';

/**
 * Override default control to pass a container
 * in constructor and register a onReady cb
 */
export default class ExtendedAttributionControl extends AttributionControl {
  constructor(options, container) {
    super(options);
    this.parentContainer = container;
  }

  onAdd(map) {
    const compact = this.options && this.options.compact;

    this._map = map;
    this._container = document.createElement('div');
    this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-attrib';

    this.parentContainer.appendChild(this._container);

    if (compact) {
      this._container.classList.add('mapboxgl-compact');
    }

    this._updateAttributions();
    this._updateEditLink();

    this._map.on('sourcedata', this._updateData);
    this._map.on('moveend', this._updateEditLink);

    if (compact === undefined) {
      this._map.on('resize', this._updateCompact);
      this._updateCompact();
    }

    return this.parentContainer;
  }
}
