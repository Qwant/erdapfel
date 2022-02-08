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

export function setHistoryPrompt(value) {
  set(SEARCH_HISTORY_KEY + '_prompt', value);
}

export function getHistoryPrompt() {
  return get(SEARCH_HISTORY_KEY + '_prompt'); // null by default, true if the prompt has been answered
}

export function getHistory() {
  return get(SEARCH_HISTORY_KEY) || [];
}

export function setHistory(searchHistory) {
  set(SEARCH_HISTORY_KEY, searchHistory);
}

export function saveQuery(item) {
  // Delete query if it's already in the list
  deleteQuery(item);

  // Retrieve the search history
  let searchHistory = getHistory();

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
  setHistory(searchHistory);
}

export function deleteQuery(item) {
  console.log('delete', item, getHistory());
  const searchHistory = getHistory();
  const index = searchHistory.findIndex(stored => itemEquals(stored, item));
  if (index === -1) {
    return;
  }
  searchHistory.splice(index, 1);
  // Serialize the list and save it in localStorage
  setHistory(searchHistory);
}

export function deleteSearchHistory() {
  del(SEARCH_HISTORY_KEY);
}

const itemEquals = ({ type, item }, other) => {
  if (type === 'intention') {
    console.log("equals", item, other);
    return (
      item.fullTextQuery === other.fullTextQuery &&
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
