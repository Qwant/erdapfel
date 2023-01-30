import { MenuType } from 'src/panel/Menu';

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = {};
  new URLSearchParams(queryString).forEach((value, key) => {
    params[key] = value;
  });
  return params;
};

const removeNullEntries = (obj: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== null && v !== undefined)) as {
    [k: string]: string;
  };

export const buildQueryString = (queriesObject: Record<string, unknown>): string => {
  const cleanedParams = removeNullEntries(queriesObject);
  const params = new URLSearchParams(cleanedParams).toString();
  return params ? `?${params}` : '';
};

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

export const getMapHash = (zoom: number, lat: number, lng: number) => {
  return `map=${zoom.toFixed(2)}/${lat.toFixed(7)}/${lng.toFixed(7)}`;
};

export const getQueryString = (url: string): string => {
  return url?.split('?')[1]?.split('#')[0];
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
  return window?.location?.pathname?.replace(new RegExp(`^${appBase}`), '');
};

export const toCssUrl = (url: string): string => {
  const escapedUrl = url.replace(/'/g, "\\'");
  return `url('${escapedUrl}')`;
};

export const updateQueryString = (queriesObject: Record<string, unknown>) => {
  return buildQueryString({
    ...parseQueryString(window.location.search),
    ...queriesObject,
  });
};

export const shouldShowBackToQwant = () => {
  const params = parseQueryString(window.location.search);
  return params?.client === 'search-ia-maps-multi' || params?.client === 'search-ia-maps-single';
};

const getDrawerUrl = (drawer: MenuType | null) =>
  getAppRelativePathname() + updateQueryString({ drawer });

export const onDrawerChange = (drawer: MenuType, isOpen: boolean) => {
  const historyState = (window?.history?.['state'] ?? {}) as unknown;
  window?.app?.navigateTo(getDrawerUrl(isOpen ? drawer : null), historyState);
};
