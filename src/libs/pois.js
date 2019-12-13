
import { version, sources } from 'config/constants.yml';
import ExtendedString from 'src/libs/string';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import LatLonPoi from 'src/adapters/poi/latlon_poi';

export function toAbsoluteUrl(poi) {
  const { protocol, host } = window.location;
  const baseUrl = window.baseUrl;
  const lat = poi.latLon.lat.toFixed(7);
  const lon = poi.latLon.lng.toFixed(7);
  const mapHash = `#map=${getBestZoom(poi.zoom)}/${lat}/${lon}`;
  return `${protocol}//${host}${baseUrl}place/${toUrl(poi)}/${mapHash}`;
}

const storeKeyPrefix = `qmaps_v${version}_favorite_place_`;

export const getKey = poi => `${storeKeyPrefix}${poi.id}`;
export const isPoiCompliantKey = key => key.indexOf(storeKeyPrefix) === 0;

export function toUrl(poi) {
  if (poi.id === 'geolocalisation' || poi.type === 'latlon') {
    return `latlon:${poi.latLon.lat.toFixed(5)}:${poi.latLon.lng.toFixed(5)}`;
  }
  return `${poi.id}@${ExtendedString.slug(poi.name)}`;
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

const ZOOM_BY_POI_TYPES = {
  street: 17,
  house: 19,
  poi: 18,
};
const DEFAULT_ZOOM = 16;

export function getBestZoom(poi) {
  return ZOOM_BY_POI_TYPES[poi.type] || DEFAULT_ZOOM;
}
