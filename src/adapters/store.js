import Error from '../adapters/error';
import { version } from '../../config/constants.yml';
import { findIndexIgnoreCase } from '../libs/string';
import { getKey } from 'src/libs/pois';
import { fire } from 'src/libs/customEvents';
import { isPoiCompliantKey } from 'src/libs/pois';

const prefix = `qmaps_v${version}_`;

export function get(k) {
  try {
    const prefixedKey = `${prefix}${k}`;
    return JSON.parse(localStorage.getItem(prefixedKey));
  } catch (e) {
    Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e);
    return null;
  }
}

export function set(k, v) {
  try {
    const prefixedKey = `${prefix}${k}`;
    localStorage.setItem(prefixedKey, JSON.stringify(v));
  } catch (e) {
    Error.sendOnce('local_store', 'set', 'error setting item', e);
  }
}

export function del(k) {
  try {
    const prefixedKey = `${prefix}${k}`;
    localStorage.removeItem(prefixedKey);
  } catch (e) {
    Error.sendOnce('local_store', 'del', 'error deleting item', e);
  }
}

/**
 * List keys without prefix.
 * In case some keys are not prefixed, we don't return them
 */
function listKeys() {
  return Object
    .keys(localStorage || {})
    .filter(k => k.indexOf(prefix) === 0)
    .map(k => k.substring(prefix.length, k.length));
}

export async function getAllFavorites() {
  let keys = [];
  try {
    keys = listKeys();
  } catch (e) {
    Error.sendOnce('local_store', 'getAllPois', 'error getting pois keys', e);
    return [];
  }
  const items = keys.reduce((filtered, k) => {
    if (isPoiCompliantKey(k)) {
      try {
        const poi = get(k);
        filtered.push(poi);
      } catch (e) {
        Error.sendOnce('local_store', 'getAllPois', 'error getting pois', e);
      }
    }
    return filtered;
  }, []);
  return items;
}

export async function getFavoritesMatching(term) {
  const storedItems = await getAllFavorites();
  return storedItems.filter(storedItem => {
    return findIndexIgnoreCase(storedItem.name, term) !== -1;
  });
}

export function isInFavorites(poi) {
  try {
    return Boolean(get(getKey(poi)));
  } catch (e) {
    Error.sendOnce('store', 'has', 'error checking existing key', e);
    return false;
  }
}

export async function addToFavorites(poi) {
  try {
    set(getKey(poi), poi);
    fire('poi_favorite_state_changed', poi, true);
  } catch (e) {
    Error.sendOnce('store', 'add', 'error adding poi', e);
  }
}

export async function removeFromFavorites(poi) {
  try {
    del(getKey(poi));
    fire('poi_favorite_state_changed', poi, false);
  } catch (e) {
    Error.sendOnce('store', 'del', 'error removing item', e);
  }
}

export async function getLastLocation() {
  try {
    return get('last_location');
  } catch (e) {
    Error.sendOnce('store', 'getLastLocation', 'error getting last location', e);
    return null;
  }
}

export async function setLastLocation(loc) {
  try {
    return set('last_location', loc);
  } catch (e) {
    Error.sendOnce('store', 'setLastLocation', 'error setting location', e);
    throw e;
  }
}
