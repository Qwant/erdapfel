import Poi from './poi';
import ajax from '../../libs/ajax';
import nconf from '@qwant/nconf-getter';
import QueryContext from '../query_context';

const serviceConfigs = nconf.get().services;
const geocoderConfig = serviceConfigs.geocoder;
const geocoderFocusPrecision = geocoderConfig.focusPrecision;

if (!window.__bragiCache) {
  window.__bragiCache = {};
}

function roundWithPrecision(value, precision) {
  const rounded = Math.round(value * (1 / precision)) * precision;
  return rounded.toFixed(3);
}

export default class BragiPoi extends Poi {
  constructor(feature, queryContext) {
    const geocodingProps = feature.properties.geocoding;
    const { id, type, label, address, city, administrative_regions } = geocodingProps;

    let poiClassText = '';
    let poiSubclassText = '';

    if (geocodingProps.properties && geocodingProps.properties.length > 0) {
      const poiClass = geocodingProps.properties.find(property => property.key === 'poi_class');
      if (poiClass) {
        poiClassText = poiClass.value;
      }
      const poiSubclass = geocodingProps.properties.find(property =>
        property.key === 'poi_subclass');
      if (poiSubclass) {
        poiSubclassText = poiSubclass.value;
      }
    }

    /* generate name corresponding to poi type */
    let name = '';
    let alternativeName = '';

    const postcode = geocodingProps.postcode && geocodingProps.postcode.split(';')[0];
    const cityObj = administrative_regions.find(region => region.zone_type === 'city');
    const country = administrative_regions.find(region => region.zone_type === 'country');
    const countryName = country && country.name;

    switch (type) {
    case 'poi':
      name = geocodingProps.name;
      alternativeName = address && address.label
        || cityObj && cityObj.label
        || [postcode, city, countryName].filter(zone => zone).join(', ');
      break;
    case 'house':
    case 'street':
      name = geocodingProps.name;
      alternativeName = [postcode, city, countryName].filter(zone => zone).join(', ');
      break;
    default: {
      /* admin */
      const splitPosition = label.indexOf(',');
      if (splitPosition === -1) {
        name = label;
      } else {
        name = label.slice(0, splitPosition);
        alternativeName = label.slice(splitPosition + 1);
      }
    }
    }

    super(id, name, alternativeName, type, {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }, poiClassText, poiSubclassText, geocodingProps.bbox);

    this.value = label;

    this.queryContext = queryContext;
  }

  getInputValue() {
    switch (this.type) {
    case 'house':
    case 'street':
      return this.value;
    default:
      return this.name;
    }
  }


  static get(term, { lat, lon, zoom } = {}) {
    let cacheKey = term;
    if (lat !== undefined && lon !== undefined) {
      lat = roundWithPrecision(lat, geocoderFocusPrecision);
      lon = roundWithPrecision(lon, geocoderFocusPrecision);
      cacheKey += `;${lat};${lon}`;
    }
    /* cache */
    if (cacheKey in window.__bragiCache) {
      const cachePromise = new Promise(resolve => {
        resolve(window.__bragiCache[cacheKey]);
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
      suggestsPromise = ajax.get(geocoderConfig.url, query);
      suggestsPromise.then(suggests => {
        let ranking = 0;
        const bragiResponse = suggests.features.map(feature => {
          ranking += 1;
          const queryContext = new QueryContext(
            term,
            ranking,
            query.lang,
            { lat, lon, zoom }
          );
          return new BragiPoi(feature, queryContext);
        });
        window.__bragiCache[cacheKey] = bragiResponse;
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
}
