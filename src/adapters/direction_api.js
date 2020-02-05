import Ajax from '../libs/ajax';
import nconf from '@qwant/nconf-getter';

const directionConfig = nconf.get().direction.service;
const timeout = nconf.get().direction.timeout;
const OVERVIEW_SETTING = 'full';
const ACCEPTED_LANGUAGES = [
  'da', 'de', 'en', 'eo', 'es', 'fi', 'fr', 'he', 'id', 'it',
  'ko', 'my', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'tr',
  'uk', 'vi', 'zh',
];

const geometries = 'geojson';

export const modes = {
  DRIVING: 'driving',
  WALKING: 'walking',
  CYCLING: 'cycling',
  PUBLIC_TRANSPORT: 'publicTransport',
};

const modeToProfile = {
  [modes.DRIVING]: 'driving-traffic',
  [modes.WALKING]: 'walking',
  [modes.CYCLING]: 'cycling',
  [modes.PUBLIC_TRANSPORT]: 'publictransport',
};

export default class DirectionApi {

  static async search(start, end, mode) {
    if (mode === modes.CYCLING) {
      // Fetch routes without ferry in priority
      const firstSearch = await DirectionApi._search(start, end, mode, { exclude: 'ferry' });
      if (firstSearch && firstSearch.routes && firstSearch.routes.length > 0) {
        return firstSearch;
      }
    }
    return DirectionApi._search(start, end, mode);
  }

  static async _search(start, end, mode, { exclude = '' } = {}) {
    const apiProfile = modeToProfile[mode];
    let directionsUrl = directionConfig.apiBaseUrl;
    const userLang = window.getLang();
    let language;
    if (ACCEPTED_LANGUAGES.indexOf(userLang.code) !== -1) {
      language = userLang.locale;
    } else {
      language = (userLang.fallback || [])[0] || 'en';
    }
    const directionsParams = mode === modes.PUBLIC_TRANSPORT ? {} : {
      geometries,
      steps: true,
      alternatives: true,
      overview: OVERVIEW_SETTING,
    };
    directionsParams.language = language;

    if (exclude) {
      directionsParams['exclude'] = exclude;
    }

    if (directionConfig.api === 'mapbox') {
      directionsUrl = `${directionsUrl}${apiProfile}/`;
      directionsParams.access_token = directionConfig.token;
    } else if (directionConfig.api === 'qwant') {
      directionsParams.type = apiProfile;
    }
    const s_start = poiToMapBoxCoordinates(start);
    const s_end = poiToMapBoxCoordinates(end);
    directionsUrl = `${directionsUrl}${s_start};${s_end}`;
    let response = null;
    try {
      response = await Ajax.get(directionsUrl, directionsParams, { timeout });
    } catch (e) {
      response = e;
    }
    if (directionConfig.api === 'qwant' && response.data) {
      response = response.data;
    }
    return response;
  }
}

const poiToMapBoxCoordinates = poi => {
  return `${poi.latLon.lng.toFixed(7)},${poi.latLon.lat.toFixed(7)}`;
};
