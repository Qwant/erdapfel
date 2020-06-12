import Poi from './poi';
import Ajax from '../../libs/ajax';
import nconf from '@qwant/nconf-getter';
import Error from '../../adapters/error';
import QueryContext from 'src/adapters/query_context';

const serviceConfig = nconf.get().services;
const LNG_INDEX = 0;
const LAT_INDEX = 1;


export default class IdunnPoi extends Poi {
  constructor(rawPoi) {
    const latLng = {
      lat: rawPoi.geometry.coordinates[LAT_INDEX],
      lng: rawPoi.geometry.coordinates[LNG_INDEX],
    };
    super(rawPoi.id, rawPoi.name, rawPoi.type, latLng, rawPoi.class_name,
      rawPoi.subclass_name);
    this.blocks = rawPoi.blocks;
    this.localName = rawPoi.local_name;
    this.address = rawPoi.address;
    this.bbox = rawPoi.geometry.bbox;
    this.meta = rawPoi.meta || {};

    this.blocksByType = {};
    if (this.blocks) {
      this.blocksByType = Object.assign({}, ...this.blocks.map(b => ({ [b.type]: b })));
      const imagesBlock = this.blocksByType.images;
      if (imagesBlock && imagesBlock.images.length > 0) {
        this.topImageUrl = imagesBlock.images[0].url;
      }
    }
  }

  getInputValue() {
    switch (this.type) {
    case 'address':
    case 'street':
      return this.alternativeName;
    case 'admin':
      return this.address?.label?.split(',')[0] || this.name;
    default:
      return this.name;
    }
  }

  /* ?bbox={bbox}&category=<category-name>&size={size}&verbosity=long/ */
  static async poiCategoryLoad(bbox, size, category, query) {
    const url = `${serviceConfig.idunn.url}/v1/places`;
    const requestParams = { bbox, size };
    if (category) {
      requestParams['category'] = category;
    }
    if (query) {
      requestParams['q'] = query;
    }

    try {
      const response = await Ajax.getLang(url, requestParams);
      response.places = response.places.map(rawPoi => new IdunnPoi(rawPoi));
      return response;
    } catch (err) {
      if (err === 400 || err === 404) {
        return {};
      } else {
        const s_requestParams = JSON.stringify(requestParams);
        Error.sendOnce(
          'idunn_poi', 'poiCategoryLoad',
          `unknown error getting idunn poi reaching ${url} with options ${s_requestParams}`,
          err
        );
        return {};
      }
    }
  }

  static async poiApiLoad(obj, options = {}) {
    let rawPoi = null;
    const url = `${serviceConfig.idunn.url}/v1/places/${obj.id}`;
    let requestParams = {};
    if (options.simple) {
      requestParams = { verbosity: 'short' };
    }
    try {
      const headers = QueryContext.toHeaders(obj.queryContext);
      rawPoi = await Ajax.getLang(url, requestParams, {}, headers);
      return new IdunnPoi(rawPoi);
    } catch (err) {
      if (err === 404) {
        return;
      } else if (err === 0 && obj.queryContext !== undefined) {
        // When the OPTIONS request is rejected, the error is 0 and not 405
        console.warn('Headers aren\'t allowed, sending query without them...');
        obj.queryContext = undefined;
        return this.poiApiLoad(obj);
      }
      const s_requestParams = JSON.stringify(requestParams);
      Error.sendOnce(
        'idunn_poi', 'poiApiLoad',
        `unknown error getting idunn poi reaching ${url} with options ${s_requestParams}`,
        err
      );
    }
  }

  _findAdmin(name) {
    if (!this.address || !this.address.admins) {
      return undefined;
    }

    return Object
      .values(this.address.admins)
      .find(a => a.class_name === name);
  }

  // @override
  getName() {
    if (this.type === 'zone') {
      const { label } = this.geocoding;
      const splitPosition = label.indexOf(',');
      if (splitPosition === -1) {
        return label;
      } else {
        return label.slice(0, splitPosition);
      }
    }

    return this.geocoding.name;
  }

  // @override
  getCity() {
    const city = this._findAdmin('city');
    return city ? city.name : undefined;
  }

  // @override
  getCountry() {
    const country = this._findAdmin('country');
    return country ? country.name : undefined;
  }

  // @override
  getAddress() {
    return this.address.name;
  }
}
