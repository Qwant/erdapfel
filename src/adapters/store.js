import Error from '../adapters/error';
import { version } from '../../config/constants.yml';
import { findIndexIgnoreCase } from '../libs/string';
import LocalStore from '../libs/local_store';
import { getKey } from 'src/libs/pois';
import { fire } from 'src/libs/customEvents';

export default class Store {
  constructor() {
    // get store from window if already initialized
    if (window.__store) {
      return window.__store;
    }
    // if store not initialized, use this
    window.__store = this;

    // init stores
    this.localStore = new LocalStore();
    this.abstractStore = this.localStore;
  }

  async getAllPois() {
    try {
      return await this.abstractStore.getAllPois();
    } catch (e) {
      Error.sendOnce('store', 'getAllPois',
        `error getting pois from ${this.abstractStore.storeName}`, e);
      return [];
    }
  }

  async getLastLocation() {
    try {
      return await this.abstractStore.get(`qmaps_v${version}_last_location`);
    } catch (e) {
      Error.sendOnce('store', 'getLastLocation',
        `error getting last location from ${this.abstractStore.storeName}`, e);
      return null;
    }
  }

  async setLastLocation(loc) {
    try {
      return await this.abstractStore.set(`qmaps_v${version}_last_location`, loc);
    } catch (e) {
      Error.sendOnce('store', 'setLastLocation',
        `error setting location in ${this.abstractStore.storeName}`, e);
      throw e;
    }
  }

  async getMatches(term) {
    const storedItems = await this.abstractStore.getAllPois();
    return storedItems.filter(storedItem => {
      return findIndexIgnoreCase(storedItem.name, term) !== -1;
    });
  }

  async has(poi) {
    try {
      return await this.abstractStore.has(getKey(poi));
    } catch (e) {
      Error.sendOnce('store', 'has',
        `error checking existing key in ${this.abstractStore.storeName}`, e);
    }
  }

  async add(poi) {
    try {
      await this.abstractStore.set(getKey(poi), poi);
      fire('poi_added_to_favs', poi);
    } catch (e) {
      Error.sendOnce('store', 'add', `error adding poi in ${this.abstractStore.storeName}`, e);
    }
  }

  async del(poi) {
    try {
      await this.abstractStore.del(getKey(poi));
      fire('poi_removed_from_favs', poi);
    } catch (e) {
      Error.sendOnce('store', 'del', `error deleting key from ${this.abstractStore.storeName}`, e);
    }
  }

  async clear() {
    try {
      await this.abstractStore.clear();
    } catch (e) {
      Error.sendOnce('store', 'clear', `error clearing ${this.abstractStore.storeName}`, e);
    }
  }
}
