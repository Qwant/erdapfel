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
    const container = super.onAdd(map);
    if (container) {
      this.parentContainer.appendChild(container);
    }
    return this.parentContainer;
  }
}
