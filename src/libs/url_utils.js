
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
  const [ zoom, lat, lng ] = zoomLatLng;
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

export function getCurrentUrl() {
  const { pathname, search, hash } = window.location;
  return `${joinPath([ pathname, search ])}${hash}`;
}
