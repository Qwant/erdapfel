
import { version } from 'config/constants.yml';

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
