import Poi, { TPoi } from './poi';
import Ajax from '../../libs/ajax';
import nconf from '@qwant/nconf-getter';
import Error from '../../adapters/error';
import QueryContext, { TQueryContext } from '../../adapters/query_context';
import { normalize as normalizeAddress, NormalizedAddress } from '../../libs/address';
import { operations, components } from 'appTypes/idunn';

const serviceConfig = nconf.get().services;

type APIGetPlacesPayload = operations['get_places_bbox_v1_places_get']['parameters']['query'];
type APIGetPlacesResponse =
  operations['get_places_bbox_v1_places_get']['responses']['200']['content']['application/json'];

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
  address?: NormalizedAddress | null;
  class_name?: string;
  subclass_name?: string;

  constructor(rawPoi: components['schemas']['Place']) {
    const latLng = {
      lat: (rawPoi?.geometry?.coordinates as number[])[1],
      lng: (rawPoi?.geometry?.coordinates as number[])[0],
    } as TPoi['latLon'];

    super(rawPoi.id, rawPoi.name, rawPoi.type, latLng, rawPoi.class_name, rawPoi.subclass_name);
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

    this.address = normalizeAddress('idunn', rawPoi);
  }

  /* ?bbox={bbox}&category=<category-name>&size={size}&verbosity=long/ */
  static async poiCategoryLoad(
    bbox: APIGetPlacesPayload['bbox'],
    size: APIGetPlacesPayload['size'],
    category: APIGetPlacesPayload['category'],
    q: APIGetPlacesPayload['q'],
    place_name: APIGetPlacesPayload['place_name'],
    place_code: APIGetPlacesPayload['place_code'],
    extendBbox = false
  ) {
    const url = `${serviceConfig.idunn.url}/v1/places`;

    const requestParams = {
      bbox,
      size,
      place_name,
      place_code,
      extend_bbox: extendBbox,
      ...(category ? { category } : {}),
      ...(q ? { q } : {}),
    };

    try {
      const response: APIGetPlacesResponse = await Ajax.getLang(url, requestParams);
      response.places = (response.places as components['schemas']['Place'][]).map(
        rawPoi => new IdunnPoi(rawPoi)
      );
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

  static async poiApiLoad(
    obj: {
      id?: string;
      queryContext?: TQueryContext;
    },
    options: { simple?: boolean } = {}
  ) {
    const url = `${serviceConfig.idunn.url}/v1/places/${obj.id}`;
    let requestParams = {};
    if (options.simple) {
      requestParams = { verbosity: 'list' };
    }
    try {
      const headers = QueryContext.toHeaders(obj?.queryContext);
      const rawPoi: components['schemas']['Place'] = await Ajax.getLang(
        url,
        requestParams,
        {},
        headers
      );
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
