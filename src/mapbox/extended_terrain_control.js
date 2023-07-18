import { TerrainControl } from 'maplibre-gl';

/**
 * Override default TerrainControl
 */

export default class ExtendedTerrainControl extends TerrainControl {
  constructor(options, container) {
    super(options);
    this.parentContainer = container;
  }

  onAdd(map) {
    const container = super.onAdd(map);
    if (container) {
      this.parentContainer.appendChild(container);
    }
    return this.parentContainer;
  }
}
