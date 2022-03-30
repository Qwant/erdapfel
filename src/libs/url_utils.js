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

export function getQueryString(url) {
  return url?.split('?')[1]?.split('#')[0];
}

export function parseQueryString(queryString) {
  const params = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

// Join parts of a path, ignoring middle '/'
// but conserving starting and trailing ones
export function joinPath(parts) {
  return parts
    .map((part, index) => {
      if (index === 0) {
        return part;
      }
      return part.replace(/^\//, '');
    })
    .map((part, index) => {
      if (index === parts.length - 1) {
        return part;
      }
      return part.replace(/\/$/, '');
    })
    .join('/');
}

export function getAppRelativePathname() {
  const appBase = (window.baseUrl || '/').replace(/\/$/, '');
  return window.location.pathname.replace(new RegExp(`^${appBase}`), '');
}

export function toCssUrl(url) {
  const escapedUrl = url.replace(/'/g, "\\'");
  return `url('${escapedUrl}')`;
}

const removeNullEntries = obj =>
  Object.keys(obj) // Object.entries is not supported by IE :(
    .map(key => [key, obj[key]])
    .filter(([, value]) => value !== null && value !== undefined)
    .reduce((result, [key, value]) => ({ ...result, [key]: value }), {});

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

const getDrawerUrl = drawer => getAppRelativePathname() + updateQueryString({ drawer });

export const onDrawerChange = (drawer, isOpen) => {
  if (isOpen) {
    window?.app?.navigateTo(getDrawerUrl(drawer), window?.history?.state || {});
  } else {
    window?.app?.navigateTo(getDrawerUrl(null), window?.history?.state || {});
  }
};
