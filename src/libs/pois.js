import { version, sources } from 'config/constants.yml';
import { slug, htmlEncode } from 'src/libs/string';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import LatLonPoi from 'src/adapters/poi/latlon_poi';

// POI from/to url functions

export function toUrl(poi) {
  if (poi.id === 'geolocalisation' || poi.type === 'latlon') {
    return `latlon:${poi.latLon.lat.toFixed(5)}:${poi.latLon.lng.toFixed(5)}`;
  }
  return poi.name ? `${poi.id}@${slug(poi.name)}` : poi.id;
}

export function toAbsoluteUrl(poi) {
  const { protocol, host } = window.location;
  const baseUrl = window.baseUrl;
  const lat = poi.latLon.lat.toFixed(7);
  const lon = poi.latLon.lng.toFixed(7);
  const mapHash = `#map=${getBestZoom(poi)}/${lat}/${lon}`;
  return `${protocol}//${host}${baseUrl}place/${toUrl(poi)}${mapHash}`;
}

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
      new LatLonPoi(latLng, label ? htmlEncode(label) : null)
    );
  }
  urlData = urlParam.match(/^(.*?)(@(.*))?$/);
  if (urlData) {
    const idunnId = urlData[1];
    return IdunnPoi.poiApiLoad({ id: idunnId });
  }
  return Promise.reject();
}

// POI fav storage functions

const storeKeyPrefix = `qmaps_v${version}_favorite_place_`;
const storeKeyPrefixWithoutVersion = 'favorite_place_';

export const getKey = poi => `${storeKeyPrefix}${poi.id}`;
export const getKeyWithoutVersion = poi => `favorite_place_${poi.id}`;
export const isPoiCompliantKey = key => key.indexOf(storeKeyPrefixWithoutVersion) === 0;

// POI source functions

export const isFromPagesJaunes = poi => poi.meta && poi.meta.source === sources.pagesjaunes;
export const isFromOSM = poi => poi.meta && poi.meta.source === sources.osm;

// POI map util functions

const DEFAULT_ZOOM = 16.5;
const ZOOM_BY_POI_TYPES = {
  street: DEFAULT_ZOOM,
  house: DEFAULT_ZOOM,
  poi: DEFAULT_ZOOM,
};

export function getBestZoom(poi) {
  return ZOOM_BY_POI_TYPES[poi.type] || DEFAULT_ZOOM;
}
