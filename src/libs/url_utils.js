import { removeNullEntries } from './object';

export function parseMapHash(hash) {
  const mapHash = hash.replace(/^#/, '');
  if (!mapHash.startsWith('map=')) {
    return;
  }
  const zoomLatLng = mapHash
    .replace(/^map=/, '')
    .split('/')
    .map(value => parseFloat(value));
  if (!zoomLatLng || zoomLatLng.length < 3) {
    return;
  }
  const [zoom, lat, lng] = zoomLatLng;
  return { zoom, lat, lng };
}

export function getMapHash(zoom, lat, lng) {
  return `map=${zoom.toFixed(2)}/${lat.toFixed(7)}/${lng.toFixed(7)}`;
}

export function parseQueryString(queryString) {
  const params = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function getAppRelativePathname() {
  const appBase = (window.baseUrl || '/').replace(/\/$/, '');
  return window.location.pathname.replace(new RegExp(`^${appBase}`), '');
}

export function toCssUrl(url) {
  const escapedUrl = url.replace(/'/g, "\\'");
  return `url('${escapedUrl}')`;
}

export function buildQueryString(queriesObject) {
  const params = new URLSearchParams(removeNullEntries(queriesObject)).toString();
  return params ? `?${params}` : '';
}

export function updateQueryString(queriesObject) {
  return buildQueryString({
    ...parseQueryString(window.location.search),
    ...queriesObject,
  });
}

export function shouldShowBackToQwant() {
  const params = parseQueryString(window.location.search);
  return params.client && params.client === 'search-ia-maps-multi';
}
