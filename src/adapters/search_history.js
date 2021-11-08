import { get, set, del } from './store';
import { findIndexIgnoreCase } from 'src/libs/string';
import Poi from 'src/adapters/poi/poi';
import Intention from 'src/adapters/intention';

const SEARCH_HISTORY_KEY = 'search_history_v1';
const HISTORY_SIZE = 100;

export function setHistoryEnabled(value) {
  set(SEARCH_HISTORY_KEY + '_enabled', value);
}

export function getHistoryEnabled() {
  return get(SEARCH_HISTORY_KEY + '_enabled');
}

export function saveQuery(item) {
  // Delete query if it's already in the list
  deleteQuery(item);

  // Retrieve the search history
  let searchHistory = get(SEARCH_HISTORY_KEY) || [];

  // Put the query at the end of the array
  searchHistory.push({
    type: item instanceof Intention ? 'intention' : 'poi',
    date: Date.now(),
    item,
  });

  // Limit the list to the last items
  if (searchHistory.length > HISTORY_SIZE) {
    searchHistory = searchHistory.slice(-HISTORY_SIZE);
  }

  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

export function deleteQuery(item) {
  const searchHistory = get(SEARCH_HISTORY_KEY) || [];
  const index = searchHistory.findIndex(stored => itemEquals(stored, item));
  if (index === -1) {
    return;
  }
  searchHistory.splice(index, 1);
  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

export function deleteSearchHistory() {
  del(SEARCH_HISTORY_KEY);
}

const itemEquals = ({ type, item }, other) => {
  if (type === 'intention') {
    return (
      other instanceof Intention &&
      item.fullTextQuery === other.fullTextQuery &&
      item.category?.name === other.category?.name &&
      item.place?.properties?.geocoding?.name === other.place?.properties?.geocoding?.name
    );
  } else {
    return other instanceof Poi && item.id === other.id;
  }
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
  const searchHistory = get(SEARCH_HISTORY_KEY) || [];
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
