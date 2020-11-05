import Error from '../adapters/error';
import { version } from '../../config/constants.yml';
import { findIndexIgnoreCase } from '../libs/string';
import { getKey } from 'src/libs/pois';
import { fire } from 'src/libs/customEvents';
import { isPoiCompliantKey } from 'src/libs/pois';

export default class Store {
  constructor() {
    // get store from window if already initialized
    if (window.__store) {
      return window.__store;
    }
    // if store not initialized, use this
    window.__store = this;
  }

  async getAllPois() {
    let localStorageKeys = [];
    try {
      localStorageKeys = Object.keys(localStorage);
    } catch (e) {
      Error.sendOnce('local_store', 'getAllPois', 'error getting pois keys', e);
      return [];
    }
    const items = localStorageKeys.reduce((filtered, k) => {
      if (isPoiCompliantKey(k)) {
        try {
          const poi = JSON.parse(localStorage.getItem(k));
          filtered.push(poi);
        } catch (e) {
          Error.sendOnce('local_store', 'getAllPois', 'error getting pois', e);
        }
      }
      return filtered;
    }, []);
    return items;
  }

  async get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch (e) {
      Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e);
      return null;
    }
  }

  async set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      Error.sendOnce('local_store', 'set', 'error setting item', e);
    }
  }

  async getLastLocation() {
    try {
      return this.get(`qmaps_v${version}_last_location`);
    } catch (e) {
      Error.sendOnce('store', 'getLastLocation', 'error getting last location', e);
      return null;
    }
  }

  async setLastLocation(loc) {
    try {
      return this.set(`qmaps_v${version}_last_location`, loc);
    } catch (e) {
      Error.sendOnce('store', 'setLastLocation', 'error setting location', e);
      throw e;
    }
  }

  async getMatches(term) {
    const storedItems = await this.getAllPois();
    return storedItems.filter(storedItem => {
      return findIndexIgnoreCase(storedItem.name, term) !== -1;
    });
  }

  async has(poi) {
    try {
      return Boolean(await this.get(getKey(poi)));
    } catch (e) {
      Error.sendOnce('store', 'has', 'error checking existing key', e);
    }
  }

  async add(poi) {
    try {
      await this.set(getKey(poi), poi);
      fire('poi_added_to_favs', poi);
    } catch (e) {
      Error.sendOnce('store', 'add', 'error adding poi', e);
    }
  }

  async del(poi) {
    try {
      localStorage.removeItem(getKey(poi));
      fire('poi_removed_from_favs', poi);
    } catch (e) {
      Error.sendOnce('store', 'del', 'error removing item', e);
    }
  }

  async clear() {
    try {
      localStorage.clear();
    } catch (e) {
      Error.sendOnce('local_store', 'clear', 'error clearing store', e);
    }
  }
}
