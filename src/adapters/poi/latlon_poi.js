import Poi from './poi';

export default class LatLonPoi extends Poi {
  constructor(lnglat, label) {
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
    super(id, label, null, null, lnglat);
    this.type = 'latlon';
  }
}
