import Poi from './poi';
import Store from '../../adapters/store';
import Error from '../error';
import Telemetry from '../../libs/telemetry';

const store = new Store();
export default class PoiStore extends Poi {

  _findAdminInAddress(name) {
    if (!this.address || !this.address.admins) {
      return undefined;
    }

    return Object
      .values(this.address.admins)
      .find(a => a.class_name === name);
  }

  // @Override
  getName() {
    return this.name || this.address.name;
  }

  // @override
  getCity() {
    const city = this._findAdminInAddress('city');
    return city ? city.name : undefined;
  }

  // @override
  getCountry() {
    const country = this._findAdminInAddress('country');
    return country ? country.name : undefined;
  }

  // @override
  getAddress() {
    return this.address ? this.address.name : undefined;
  }

  static async get(term) {
    try {
      const matches = await store.getMatches(term);
      return matches.map(match => Object.assign(new PoiStore(), match));
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
}
