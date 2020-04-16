import ajax from 'src/libs/ajax';
import nconf from '@qwant/nconf-getter';
import QueryContext from 'src/adapters/query_context';
import BragiPoi from 'src/adapters/poi/bragi_poi';
import Intention from './intention';

const serviceConfigs = nconf.get().services;
const geocoderConfig = serviceConfigs.geocoder;
const geocoderFocusPrecision = geocoderConfig.focusPrecision;

const bragiCache = {};

function roundWithPrecision(value, precision) {
  const rounded = Math.round(value * (1 / precision)) * precision;
  return rounded.toFixed(3);
}

export function getGeocoderSuggestions(term, { lat, lon, zoom } = {}) {
  let cacheKey = term;
  if (lat !== undefined && lon !== undefined) {
    lat = roundWithPrecision(lat, geocoderFocusPrecision);
    lon = roundWithPrecision(lon, geocoderFocusPrecision);
    cacheKey += `;${lat};${lon}`;
  }
  /* cache */
  if (cacheKey in bragiCache) {
    const cachePromise = new Promise(resolve => {
      resolve(bragiCache[cacheKey]);
    });
    cachePromise.abort = () => {};
    return cachePromise;
  }
  /* ajax */
  let suggestsPromise;
  const queryPromise = new Promise(async (resolve, reject) => {
    const query = {
      'q': term,
      'limit': geocoderConfig.maxItems,
    };
    if (lat !== undefined && lon !== undefined) {
      query.lat = lat;
      query.lon = lon;
    }
    if (geocoderConfig.useLang) {
      query.lang = window.getLang().code;
    }
    if (geocoderConfig.useNlu) {
      query.nlu = 'true';
    }
    suggestsPromise = ajax.get(geocoderConfig.url, query);
    suggestsPromise.then(({ features, intentions }) => {
      const pois = features.map((feature, index) => {
        const queryContext = new QueryContext(
          term,
          index + 1, // ranking
          query.lang,
          { lat, lon, zoom }
        );
        return new BragiPoi(feature, queryContext);
      });
      const bragiResponse = {
        pois,
        intentions: intentions.map(intention => new Intention(intention)),
      };
      bragiCache[cacheKey] = bragiResponse;
      resolve(bragiResponse);
    }).catch(error => {
      if (error === 0) { /* abort */
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
