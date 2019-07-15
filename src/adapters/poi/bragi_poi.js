import Poi from './poi';
import ajax from '../../libs/ajax';
import nconf from '@qwant/nconf-getter';
import QueryContext from '../query_context';

const serviceConfigs = nconf.get().services;
const geocoderConfig = serviceConfigs.geocoder;

if (!window.__bragiCache) {
  window.__bragiCache = {};
}

export default class BragiPoi extends Poi {
  constructor(feature, queryContext) {

    let poiClassText = '';
    let poiSubclassText = '';

    if (feature.properties.geocoding.properties &&
        feature.properties.geocoding.properties.length > 0) {
      const poiClass = feature.properties.geocoding.properties.find(property => {
        return property.key === 'poi_class';
      });

      if (poiClass) {
        poiClassText = poiClass.value;
      }
      const poiSubclass = feature.properties.geocoding.properties.find(property => {
        return property.key === 'poi_subclass';
      });
      if (poiSubclass) {
        poiSubclassText = poiSubclass.value;
      }
    }
    let addressLabel = '';
    if (feature.properties &&
        feature.properties.geocoding &&
        feature.properties.geocoding.address) {
      addressLabel = feature.properties.geocoding.address.label;
    }

    /* generate name corresponding to poi type */
    let name = '';
    let alternativeName = '';
    const adminLabel = '';
    const resultType = feature.properties.geocoding.type;

    let postcode;
    if (feature.properties.geocoding.postcode) {
      postcode = feature.properties.geocoding.postcode.split(';')[0];
    }
    const city = feature.properties.geocoding.city;
    const country = feature.properties.geocoding.administrative_regions.find(administrativeRegion =>
      administrativeRegion.zone_type === 'country'
    );
    let countryName;
    if (country) {
      countryName = country.name;
    }

    switch (resultType) {
    case 'poi':
      name = feature.properties.geocoding.name;
      alternativeName = addressLabel;
      break;
    case 'house':
      name = feature.properties.geocoding.name;

      alternativeName = [postcode, city, countryName].filter(zone => zone).join(', ');

      break;
    case 'street':
      name = feature.properties.geocoding.name;
      alternativeName = [postcode, city, countryName].filter(zone => zone).join(', ');

      break;
    default: {
      /* admin */
      const splitPosition = feature.properties.geocoding.label.indexOf(',');
      let nameFragments;
      if (splitPosition === -1) {
        nameFragments = [feature.properties.geocoding.label];
      } else {
        nameFragments = [
          feature.properties.geocoding.label.slice(0, splitPosition),
          feature.properties.geocoding.label.slice(splitPosition + 1),
        ];
      }
      if (nameFragments.length > 1) {
        name = nameFragments[0];
        alternativeName = nameFragments[1];
      } else {
        name = feature.properties.geocoding.label;
        alternativeName = '';
      }
    }
    }

    super(feature.properties.geocoding.id, name, alternativeName, resultType, {
      lat: feature.geometry.coordinates[1],
      lng: feature.geometry.coordinates[0],
    }, poiClassText, poiSubclassText);
    /* extract custom data for autocomplete */
    this.value = feature.properties.geocoding.label;
    this.adminLabel = adminLabel;

    this.city = feature.properties.geocoding.city;
    /* extract country */

    /* extract bbox */
    if (feature.properties.geocoding.bbox) {
      this.bbox = feature.properties.geocoding.bbox;
    }
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


  static get(term, focus) {
    let req = term;
    if (focus && focus.lat !== undefined && focus.lon !== undefined) {
      req += `&${focus.lat}:${focus.lon}`;
    }
    /* cache */
    if (req in window.__bragiCache) {
      const cachePromise = new Promise(resolve => {
        resolve(window.__bragiCache[req]);
      });
      cachePromise.abort = () => {};
      return cachePromise;
    }

    /* ajax */
    let suggestsPromise;
    const queryPromise = new Promise(async (resolve, reject) => {
      const query = {
        'q': term,
        'limit': geocoderConfig.max_items,
      };
      if (focus && focus.lat !== undefined && focus.lon !== undefined) {
        query['lat'] = focus.lat;
        query['lon'] = focus.lon;
      }
      if (geocoderConfig.useLang) {
        query.lang = window.getLang().code;
      }
      suggestsPromise = ajax.get(geocoderConfig.url, query);
      suggestsPromise.then(suggests => {
        let ranking = 0;
        const bragiResponse = suggests.features.map(feature => {
          ranking += 1;
          // FIXME: add position when https://github.com/QwantResearch/erdapfel/pull/291 is merged.
          return new BragiPoi(feature, new QueryContext(term, ranking, query.lang));
        });
        window.__bragiCache[req] = bragiResponse;
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
