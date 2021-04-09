import Poi from './poi';
import { getAllFavorites, getFavoritesMatching } from 'src/adapters/store';
import Error from '../error';
import Telemetry from '../../libs/telemetry';
import { normalize as normalizeAddress } from 'src/libs/address';

export default class PoiStore extends Poi {
  static new(rawStorePoi) {
    const poi = Object.assign(new PoiStore(), rawStorePoi);
    if (poi?.address?.admins) {
      // The address has been stored with the raw Idunn format
      // and should be normalized before usage
      poi.address = normalizeAddress('idunn', poi);
    }
    return poi;
  }

  static get(term) {
    try {
      return getFavoritesMatching(term).map(match => PoiStore.new(match));
    } catch (e) {
      Error.sendOnce('poi_store', 'get', 'error getting matching favorites', e);
      return [];
    }
  }

  static getAll() {
    try {
      return getAllFavorites().map(poi => PoiStore.new(poi));
    } catch (e) {
      Telemetry.add(Telemetry.FAVORITE_ERROR_LOAD_ALL);
      Error.sendOnce('poi_store', 'getAll', 'error getting pois', e);
      return [];
    }
  }
}
