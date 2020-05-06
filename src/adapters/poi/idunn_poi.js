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
    let alternativeName = '';
    if (rawPoi.address) {
      if (rawPoi.address.label) {
        alternativeName = rawPoi.address.label;
      } else if (rawPoi.address.street && rawPoi.address.street.label) {
        alternativeName = rawPoi.address.street.label;
      }
    }
    const latLng = {
      lat: rawPoi.geometry.coordinates[LAT_INDEX],
      lng: rawPoi.geometry.coordinates[LNG_INDEX],
    };
    super(rawPoi.id, rawPoi.name, alternativeName, rawPoi.type, latLng, rawPoi.class_name,
      rawPoi.subclass_name);
    this.blocks = rawPoi.blocks;
    this.localName = rawPoi.local_name;
    this.address = IdunnPoi.getAddress(rawPoi);
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
      if (this.address && this.address.label) {
        const split = this.address.label.split(',');
        if (split[0]) {
          return split[0];
        }
      }
      return this.name;
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

  static async poiEventLoad(bbox, size, category) {
    const url = `${serviceConfig.idunn.url}/v1/events`;
    const requestParams = { bbox, size };
    if (category) {
      requestParams['category'] = category;
    }

    try {
      const response = await Ajax.getLang(url, requestParams);
      response.events = response.events.map(rawPoi => new IdunnPoi(rawPoi));
      return response;
    } catch (err) {
      if (err === 400 || err === 404 ) {
        return {};
      } else {
        const s_requestParams = JSON.stringify(requestParams);
        Error.sendOnce(
          'idunn_poi', 'poiEventLoad',
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

  static getAddress(rawPoi) {
    switch (rawPoi.type) {
    case 'admin':
      return { label: rawPoi.address.admin.label };
    case 'address':
    case 'street': {
      const postcode = (rawPoi.address.postcode || '').split(';', 1)[0];
      const city = rawPoi.address.admins.find(a => a.class_name === 'city') || {};
      const country = rawPoi.address.admins.find(a => a.class_name === 'country') || {};
      const label = [postcode, city.name, country.name]
        .filter(x => x).join(', ');
      return { label };
    }
    default:
      return rawPoi.address;
    }
  }
}
