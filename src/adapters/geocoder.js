import ajax from 'src/libs/ajax';
import nconf from '@qwant/nconf-getter';
import QueryContext from 'src/adapters/query_context';
import BragiPoi from 'src/adapters/poi/bragi_poi';
import Intention from './intention';

const serviceConfigs = nconf.get().services;
const {
  focusPrecision,
  focusZoomPrecision,
  maxItems,
  useFocus,
  useLang,
  useNlu: geocoderUseNlu,
  url: geocoderUrl,
} = serviceConfigs.geocoder;

const bragiCache = {};

function roundWithPrecision(value, precision, digits = 3) {
  const rounded = Math.round(value * (1 / precision)) * precision;
  return rounded.toFixed(digits);
}

function getFocusParams({ lat, lon, zoom }) {
  if (!useFocus) {
    return null;
  }
  if (lat === undefined || lon === undefined || zoom === undefined) {
    return null;
  }

  // Get the precision specific to a zoom level
  const zoomFocusPrecision = JSON.parse(focusPrecision)
    .filter(zp => zoom > zp.zoom)
    .map(zp => zp.precision)
    .sort()
    .shift();

  if (zoomFocusPrecision === undefined) {
    return null;
  }
  return {
    lat: roundWithPrecision(lat, zoomFocusPrecision),
    lon: roundWithPrecision(lon, zoomFocusPrecision),
    zoom: roundWithPrecision(zoom, focusZoomPrecision),
  };
}

export function getGeocoderSuggestions(term, { focus = {}, useNlu = false } = {}) {
  let cacheKey = term;
  const focusParams = getFocusParams(focus);
  if (focusParams) {
    const { lat, lon, zoom } = focusParams;
    cacheKey += `;${lat};${lon};${zoom}`;
  }
  /* cache */
  if (cacheKey in bragiCache) {
    const cachePromise = new Promise(resolve => {
      resolve(bragiCache[cacheKey]);
    });
    cachePromise.abort = () => undefined;
    return cachePromise;
  }
  /* ajax */
  let suggestsPromise;
  const queryPromise = new Promise((resolve, reject) => {
    const query = {
      q: term,
      limit: maxItems,
      ...focusParams,
    };
    if (useLang) {
      query.lang = window.getLang().code;
    }
    if (geocoderUseNlu && useNlu) {
      query.nlu = 'true';
    }
    suggestsPromise = ajax.get(geocoderUrl, query);
    suggestsPromise
      .then(({ features, intention }) => {
        const pois = features.map((feature, index) => {
          const queryContext = new QueryContext(
            term,
            index + 1, // ranking
            query.lang,
            focusParams
          );
          return new BragiPoi(feature, queryContext);
        });
        const bragiResponse = { pois };
        if (intention) {
          const parsed = new Intention(intention);
          if (parsed.isValid()) {
            bragiResponse.intention = [parsed];
          }
        }
        bragiCache[cacheKey] = bragiResponse;
        resolve(bragiResponse);
      })
      .catch(error => {
        if (error === 0) {
          /* abort */
          resolve(null);
        } else {
          reject(error);
        }
      });
  });
  queryPromise.abort = () => {
    suggestsPromise.abort();
  };
  return queryPromise;
}
