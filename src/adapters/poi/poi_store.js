import Poi from './poi';
import Store from '../../adapters/store';
import Error from '../error';
import Telemetry from '../../libs/telemetry';
import IdunnPoi from './idunn_poi';

const store = new Store();
export default class PoiStore extends Poi {
  static async get(term) {
    try {
      const prefixes = await store.getPrefixes(term);
      return prefixes.map(historySuggest => {
        return Object.assign(new PoiStore(), historySuggest);
      });
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
    return storedData.map(poi => {
      return Object.assign(new PoiStore(), poi);
    });
  }

  static deserialize(raw) {
    const {
      id, name, alternativeName, type, latLon, className, subClassName, bbox, blocks,
      topImageUrl, kind,
    } = raw;
    if (kind === 'idunn') {
      return new IdunnPoi(raw);
    }
    return new Poi(id, name, alternativeName, type, latLon, className, subClassName, bbox, blocks,
      topImageUrl, raw);
  }
}
