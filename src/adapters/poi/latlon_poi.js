import Poi from './poi';
import ExtendedString from '../../libs/string';
import IdunnPoi from './idunn_poi';

const LAT_POSITION = 1;
const LON_POSITION = 2;
const LABEL_POSITION = 4;
const DIRECTION_URL_REGEX = /^latlon:(-?\d*\.\d*):(-?\d*\.\d*)(@(.*))?/;

export default class LatLonPoi extends Poi {
  constructor(latLon, label) {
    const id = `latlon:${latLon.lat.toFixed(5)}:${latLon.lng.toFixed(5)}`;

    if (!label) {
      label = `${latLon.lat.toFixed(5)} : ${latLon.lng.toFixed(5)}`;
    }
    super(id, label, null, null, latLon);
  }

  toUrl() {
    return this.id;
  }

  static async fromUrl(urlParam) {
    if (!urlParam) {
      return Promise.reject();
    }

    if (urlParam.match(/^latlon:/)) {
      const urlData = urlParam.match(DIRECTION_URL_REGEX);
      const lat = urlData[LAT_POSITION];
      const lng = urlData[LON_POSITION];

      if (lat && lng) {
        const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
        if (urlData[LABEL_POSITION]) {
          return Promise.resolve(
            new LatLonPoi(latLng, ExtendedString.htmlEncode(urlData[LABEL_POSITION]))
          );
        }
        return Promise.resolve(new LatLonPoi(latLng));
      }
    } else {
      const urlData = urlParam.match(/^(.*?)(@(.*))?$/);
      const idunnId = urlData[1];
      return IdunnPoi.poiApiLoad({ 'id': idunnId });
    }
  }
}
