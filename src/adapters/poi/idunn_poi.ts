import Poi from './poi';
import Ajax from '../../libs/ajax';
import nconf from '@qwant/nconf-getter';
import Error from '../../adapters/error';
import QueryContext from '../../adapters/query_context';
import { normalize as normalizeAddress } from '../../libs/address';
import { components } from '../../../@types/idunn';

const serviceConfig = nconf.get().services;

export default class IdunnPoi extends Poi {
  blocks?: components['schemas']['Place']['blocks'] & { type?: string }[];
  localName?: string;
  meta?: components['schemas']['PlaceMeta'];
  blocksByType: {
    images?: {
      images: { url: string }[];
    };
  };
  titleImageUrl?: string;
  address?: components['schemas']['Address'];
  class_name?: string;
  subclass_name?: string;

  constructor(rawPoi: components['schemas']['Place']) {
    const latLng = {
      lat: (rawPoi?.geometry?.coordinates as number[])[1],
      lng: (rawPoi?.geometry?.coordinates as number[])[0],
    };

    super(
      rawPoi.id,
      rawPoi.name,
      rawPoi.type,
      latLng as any, // TODO: Check why lat/lng and not lat/lon
      rawPoi.class_name,
      rawPoi.subclass_name
    );
    this.blocks = rawPoi.blocks;
    this.localName = rawPoi.local_name;
    this.bbox = rawPoi?.geometry?.bbox as [number, number, number, number]; // TODO: Check if there is always a bbox on Idunn Place
    this.meta = rawPoi.meta || {};

    this.blocksByType = {};
    if (this.blocks) {
      this.blocksByType = Object.assign(
        {},
        ...this.blocks.map(b => ({ [(b?.type ?? '') as string]: b }))
      );
      const imagesBlock = this.blocksByType.images;
      if (imagesBlock && imagesBlock.images.length > 0) {
        this.titleImageUrl = imagesBlock.images[0].url;
      }
    }

    this.address = normalizeAddress('idunn', rawPoi) as components['schemas']['Address'];
  }

  /* ?bbox={bbox}&category=<category-name>&size={size}&verbosity=long/ */
  static async poiCategoryLoad(bbox, size, category, query, extendBbox = false) {
    const url = `${serviceConfig.idunn.url}/v1/places`;
    const requestParams = {
      bbox,
      size,
      extend_bbox: extendBbox,
      ...(category ? { category } : {}),
      ...(query ? { q: query } : {}),
    };

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
          'idunn_poi',
          'poiCategoryLoad',
          `unknown error getting idunn poi reaching ${url} with options ${s_requestParams}`,
          err
        );
        return {};
      }
    }
  }

  static async poiApiLoad(obj, options: any /* TODO */ = {}) {
    let rawPoi;
    const url = `${serviceConfig.idunn.url}/v1/places/${obj.id}`;
    let requestParams = {};
    if (options.simple) {
      requestParams = { verbosity: 'list' };
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
        console.warn("Headers aren't allowed, sending query without them...");
        obj.queryContext = undefined;
        return this.poiApiLoad(obj);
      }
      const s_requestParams = JSON.stringify(requestParams);
      Error.sendOnce(
        'idunn_poi',
        'poiApiLoad',
        `unknown error getting idunn poi reaching ${url} with options ${s_requestParams}`,
        err
      );
    }
  }
}
