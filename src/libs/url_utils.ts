export const parseMapHash = (hash: string) => {
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
};

export const getMapHash = (zoom, lat, lng) => {
  return `map=${zoom.toFixed(2)}/${lat.toFixed(7)}/${lng.toFixed(7)}`;
};

export const getQueryString = (url: string): string => {
  return url?.split('?')[1]?.split('#')[0];
};

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

// Join parts of a path, ignoring middle '/'
// but conserving starting and trailing ones
export const joinPath = (parts: string[]): string => {
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
};

export const getAppRelativePathname = () => {
  const appBase = (window.baseUrl || '/').replace(/\/$/, '');
  return window.location.pathname.replace(new RegExp(`^${appBase}`), '');
};

export const toCssUrl = (url: string): string => {
  const escapedUrl = url.replace(/'/g, "\\'");
  return `url('${escapedUrl}')`;
};

const removeNullEntries = (obj: Record<string, string>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined));

export const buildQueryString = (queriesObject: Record<string, string>): string => {
  const params = new URLSearchParams(removeNullEntries(queriesObject)).toString();
  return params ? `?${params}` : '';
};

export const updateQueryString = (queriesObject: Record<string, string>) => {
  return buildQueryString({
    ...parseQueryString(window.location.search),
    ...queriesObject,
  });
};

export const shouldShowBackToQwant = () => {
  const params = parseQueryString(window.location.search);
  return params?.client === 'search-ia-maps-multi' || params?.client === 'search-ia-maps-single';
};

const getDrawerUrl = drawer => getAppRelativePathname() + updateQueryString({ drawer });

export const onDrawerChange = (drawer, isOpen) => {
  if (isOpen) {
    window?.app?.navigateTo(getDrawerUrl(drawer), window?.history?.state || {});
  } else {
    window?.app?.navigateTo(getDrawerUrl(null), window?.history?.state || {});
  }
};
