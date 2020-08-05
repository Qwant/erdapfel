import Poi from './poi';
import Store from '../../adapters/store';
import Error from '../error';
import Telemetry from '../../libs/telemetry';
import { normalize as normalizeAddress } from 'src/libs/address';

const store = new Store();
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

  static async get(term) {
    try {
      const matches = await store.getMatches(term);
      return matches.map(match => PoiStore.new(match));
    } catch (e) {
      Error.sendOnce('poi_store', 'get', 'error getting matching favorites', e);
      return [];
    }
  }

  static async getAll() {
    let storedData = [];
    try {
      storedData = await store.getAllPois();
    } catch (e) {
      Telemetry.add(Telemetry.FAVORITE_ERROR_LOAD_ALL);
      Error.sendOnce('poi_store', 'getAll', 'error getting pois', e);
      return [];
    }
    return storedData.map(poi => PoiStore.new(poi));
  }
}
