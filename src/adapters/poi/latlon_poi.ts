import Poi from './poi';
import type { LngLat } from 'maplibre-gl';

export default class LatLonPoi extends Poi {
  constructor(lnglat: LngLat, label: string) {
    if (typeof lnglat.wrap === 'function') {
      // mapbox-gl LngLat provides a wrap() method to wrap longitude values.
      // These values are out of bounds for points on world copies
      // (i.e. when multiple worlds are visible at lower zooms).
      lnglat = lnglat.wrap();
    }
    const id = `latlon:${lnglat.lat.toFixed(5)}:${lnglat.lng.toFixed(5)}`;

    if (!label) {
      label = `${lnglat.lat.toFixed(5)} : ${lnglat.lng.toFixed(5)}`;
    }
    super(id, id, label, undefined, lnglat, undefined, undefined);
    this.type = 'latlon';
  }
}
