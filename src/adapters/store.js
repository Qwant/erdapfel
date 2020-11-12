import Error from '../adapters/error';
import { version } from '../../config/constants.yml';
import { findIndexIgnoreCase } from '../libs/string';
import { getKeyWithoutVersion } from 'src/libs/pois';
import { fire } from 'src/libs/customEvents';
import { isPoiCompliantKey } from 'src/libs/pois';

const prefix = `qmaps_v${version}_`;

function get(k) {
  try {
    const prefixedKey = `${prefix}${k}`;
    return JSON.parse(localStorage.getItem(prefixedKey));
  } catch (e) {
    Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e);
    return null;
  }
}

function set(k, v) {
  try {
    const prefixedKey = `${prefix}${k}`;
    localStorage.setItem(prefixedKey, JSON.stringify(v));
  } catch (e) {
    Error.sendOnce('local_store', 'set', 'error setting item', e);
  }
}

function del(k) {
  const prefixedKey = `${prefix}${k}`;
  localStorage.removeItem(prefixedKey);
}

/**
 * List keys without prefix.
 * In case some keys are not prefixed, we don't return them
 */
function listKeys() {
  return Object
    .keys(localStorage || {})
    .reduce((acc, k) => {
      const parts = k.split(prefix);
      return parts.length === 2
        ? [...acc, parts[1]]
        : acc;
    }, []);
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

export async function isInFavorites(poi) {
  try {
    return Boolean(get(getKeyWithoutVersion(poi)));
  } catch (e) {
    Error.sendOnce('store', 'has', 'error checking existing key', e);
  }
}

export async function addToFavorites(poi) {
  try {
    set(getKeyWithoutVersion(poi), poi);
    fire('poi_added_to_favs', poi);
  } catch (e) {
    Error.sendOnce('store', 'add', 'error adding poi', e);
  }
}

export async function removeFromFavorites(poi) {
  try {
    del(getKeyWithoutVersion(poi));
    fire('poi_removed_from_favs', poi);
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
