import Error from '../adapters/error';
import { version } from '../../config/constants.yml';
import { findIndexIgnoreCase } from '../libs/string';
import { getKey } from 'src/libs/pois';
import { fire } from 'src/libs/customEvents';
import { isPoiCompliantKey } from 'src/libs/pois';

function get(k) {
  try {
    return JSON.parse(localStorage.getItem(k));
  } catch (e) {
    Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e);
    return null;
  }
}

function set(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    Error.sendOnce('local_store', 'set', 'error setting item', e);
  }
}

export async function getAllFavorites() {
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

export async function getFavoritesMatching(term) {
  const storedItems = await getAllFavorites();
  return storedItems.filter(storedItem => {
    return findIndexIgnoreCase(storedItem.name, term) !== -1;
  });
}

export async function isInFavorites(poi) {
  try {
    return Boolean(get(getKey(poi)));
  } catch (e) {
    Error.sendOnce('store', 'has', 'error checking existing key', e);
  }
}

export async function addToFavorites(poi) {
  try {
    set(getKey(poi), poi);
    fire('poi_added_to_favs', poi);
  } catch (e) {
    Error.sendOnce('store', 'add', 'error adding poi', e);
  }
}

export async function removeFromFavorites(poi) {
  try {
    localStorage.removeItem(getKey(poi));
    fire('poi_removed_from_favs', poi);
  } catch (e) {
    Error.sendOnce('store', 'del', 'error removing item', e);
  }
}

export async function getLastLocation() {
  try {
    return get(`qmaps_v${version}_last_location`);
  } catch (e) {
    Error.sendOnce('store', 'getLastLocation', 'error getting last location', e);
    return null;
  }
}

export async function setLastLocation(loc) {
  try {
    return set(`qmaps_v${version}_last_location`, loc);
  } catch (e) {
    Error.sendOnce('store', 'setLastLocation', 'error setting location', e);
    throw e;
  }
}
