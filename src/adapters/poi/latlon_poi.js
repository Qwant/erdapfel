import Poi from './poi';

export default class LatLonPoi extends Poi {
  constructor(latLon, label) {
    const id = `latlon:${latLon.lat.toFixed(5)}:${latLon.lng.toFixed(5)}`;

    if (!label) {
      label = `${latLon.lat.toFixed(5)} : ${latLon.lng.toFixed(5)}`;
    }
    super(id, label, null, null, latLon);
    this.type = 'latlon';
  }
}
