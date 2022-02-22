import { get, set, del } from './store';
import { findIndexIgnoreCase } from 'src/libs/string';
import Poi from 'src/adapters/poi/poi';
import Intention from 'src/adapters/intention';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import BragiPoi from 'src/adapters/poi/bragi_poi';
import LatLonPoi from 'src/adapters/poi/latlon_poi';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Category from 'src/adapters/category';

const SEARCH_HISTORY_KEY = 'search_history_v1';

export function setHistoryEnabled(value) {
  set(SEARCH_HISTORY_KEY + '_enabled', value);
}

export function getHistoryEnabled() {
  return get(SEARCH_HISTORY_KEY + '_enabled');
}

export function getHistory() {
  return get(SEARCH_HISTORY_KEY) || [];
}

export function setHistory(searchHistory) {
  set(SEARCH_HISTORY_KEY, searchHistory);
}

function getQueryType(item) {
  switch (true) {
    case item instanceof Poi:
    case item instanceof BragiPoi:
    case item instanceof IdunnPoi:
    case item instanceof NavigatorGeolocalisationPoi:
    case item instanceof LatLonPoi:
      return 'poi';
    case item instanceof Intention:
    case item instanceof Category:
      return 'intention';
    default:
      return 'intention';
  }
}

export async function saveQuery(item) {
  // Delete query if it's already in the list
  deleteQuery(item);

  // Retrieve the search history
  const searchHistory = getHistory();

  // Put the query at the end of the array
  searchHistory.push({
    type: getQueryType(item),
    date: Date.now(),
    item,
  });

  // Serialize the list and save it in localStorage
  setHistory(searchHistory);
}

export function deleteQuery(item) {
  const searchHistory = getHistory();
  let index;
  for (index = searchHistory.length - 1; index >= 0; index--) {
    if (itemEquals(searchHistory[index], item)) {
      searchHistory.splice(index, 1);
    }
  }
  // Serialize the list and save it in localStorage
  setHistory(searchHistory);
}

export function deleteSearchHistory() {
  del(SEARCH_HISTORY_KEY);
}

const itemEquals = ({ type, item }, other) => {
  if (type === 'intention') {
    return (
      item.category?.name === other.category?.name &&
      item.place?.properties?.geocoding?.name === other.place?.properties?.geocoding?.name
    );
  } else if (type === 'poi') {
    return item.id === other.id;
  }
  return false;
};

const itemMatches = ({ type, item }, term) => {
  const matchStrings = [];
  if (type === 'intention') {
    matchStrings.push(item.fullTextQuery);
    matchStrings.push(item.category?.name);
    matchStrings.push(item.place?.properties?.geocoding?.name);
  } else {
    matchStrings.push(item.name);
  }
  return matchStrings.filter(s => s).some(str => findIndexIgnoreCase(str, term) !== -1);
};

export function getHistoryItems(term = '', { withIntentions = false } = {}) {
  const searchHistory = getHistory();
  return searchHistory
    .reverse() // so it's ordered with most recent items first
    .filter(stored => withIntentions || stored.type !== 'intention')
    .filter(stored => itemMatches(stored, term))
    .map(stored => {
      if (stored.type === 'intention') {
        return Object.assign(
          new Intention({ filter: stored.item.filter, description: { place: stored.item.place } }),
          stored.item
        );
      } else {
        return Object.assign(new Poi(), stored.item);
      }
    });
}

export function listHistoryItemsByDate(from, to) {
  return getHistory()
    .reverse() // so it's ordered with most recent items first
    .filter(item => item.date >= from && item.date < to); // filter by date range
}

export function historyLength() {
  const searchHistory = getHistory();
  return searchHistory.length;
}
