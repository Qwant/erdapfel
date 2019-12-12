
import { version, sources } from 'config/constants.yml';
import ExtendedString from 'src/libs/string';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import LatLonPoi from 'src/adapters/poi/latlon_poi';

export function toAbsoluteUrl(poi) {
  const { protocol, host } = window.location;
  const baseUrl = window.baseUrl;
  const lat = poi.latLon.lat.toFixed(7);
  const lon = poi.latLon.lng.toFixed(7);
  return `${protocol}//${host}${baseUrl}place/${poi.toUrl()}/#map=${poi.zoom}/${lat}/${lon}`;
}

const storeKeyPrefix = `qmaps_v${version}_favorite_place_`;

export const getKey = poi => `${storeKeyPrefix}${poi.id}`;
export const isPoiCompliantKey = key => key.indexOf(storeKeyPrefix) === 0;

export function fromUrl(urlParam) {
  if (!urlParam) {
    return Promise.reject();
  }

  const latLonUrlRegex = /^latlon:(-?\d*\.\d*):(-?\d*\.\d*)(?:@(.*))?/;
  let urlData = urlParam.match(latLonUrlRegex);
  if (urlData) {
    const [ _, lat, lng, label ] = urlData;
    const latLng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    return Promise.resolve(
      new LatLonPoi(latLng, label ? ExtendedString.htmlEncode(label) : null)
    );
  } else {
    urlData = urlParam.match(/^(.*?)(@(.*))?$/);
    if (urlData) {
      const idunnId = urlData[1];
      return IdunnPoi.poiApiLoad({ id: idunnId });
    }
  }
  return Promise.reject();
}

export function isFromPagesJaunes(poi) {
  return poi.meta && poi.meta.source === sources.pagesjaunes;
}

export function isFromOSM(poi) {
  return poi.meta && poi.meta.source === sources.osm;
}
