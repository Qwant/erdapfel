import { TerrainControl } from 'maplibre-gl';

/**
 * Override default TerrainControl
 */

export default class ExtendedTerrainControl extends TerrainControl {
  constructor(options, container, map) {
    super(options);
    this.parentContainer = container;
    this.visible = false;
    this.map = map;
  }

  onAdd(map) {
    const container = super.onAdd(map);
    if (container) {
      this.parentContainer.appendChild(container);
    }
    return this.parentContainer;
  }

  _toggleTerrain() {
    if (this.visible) {
      this.visible = false;
      this.map.setLayoutProperty('hills', 'visibility', 'none');
    } else {
      this.visible = true;
      this.map.setLayoutProperty('hills', 'visibility', 'visible');
    }
    super._toggleTerrain();
  }
}
