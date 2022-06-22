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

export function getQueryType(item) {
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

// Add a query in History.
// The type is optional, used to revisit items from the History. Otherwise, it is guessed by getQueryType.
export async function saveQuery(item, type) {
  // Retrieve the search history
  const searchHistory = getHistory();

  // Put the query at the end of the array
  searchHistory.push({
    type: type || getQueryType(item),
    date: Date.now(),
    item,
  });

  // Serialize the list and save it in localStorage
  setHistory(searchHistory);
}

// Delete a query from the History
// if the deletion occurs from the suggest, fromSuggest will be true,
// in that case the latest occurrence of that item will be deleted.
// if the deletion occurs from history panel, fromSuggest will be false,
// in that case an exact date equality will be checked
export function deleteQuery(item, fromSuggest) {
  const searchHistory = getHistory();
  let index;

  for (index = searchHistory.length - 1; index >= 0; index--) {
    if (itemEquals(searchHistory[index], item, fromSuggest)) {
      searchHistory.splice(index, 1);
    }
  }
  // Serialize the list and save it in localStorage
  setHistory(searchHistory);
}

export function deleteSearchHistory() {
  del(SEARCH_HISTORY_KEY);
}

// Compare two History items
// - intention: compare category name + place name (+ date)
// - poi: compare id (+ date)
// Date is only compared if deleteMostRecent is false.
const itemEquals = (current, other, deleteMostRecent) => {
  if (current.type === 'intention') {
    return (
      current.item.category?.name === other.item.category?.name &&
      current.item.place?.properties?.geocoding?.name ===
        other.item.place?.properties?.geocoding?.name &&
      (deleteMostRecent || current.date === other.date)
    );
  } else if (current.type === 'poi') {
    return current.item.id === other.item.id && (deleteMostRecent || current.date === other.date);
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
    .filter(
      (
        value,
        index,
        self // deduplicate history items by id or category name (but not by date)
      ) =>
        index ===
        self.findIndex(t =>
          t.item.id
            ? t.item.id === value.item.id
            : t.item.category?.name === value.item.category?.name
        )
    )
    .filter(stored => withIntentions || stored.type !== 'intention')
    .filter(stored => itemMatches(stored, term))
    .map(stored => {
      if (stored.type === 'intention') {
        const res = Object.assign(
          new Intention({ filter: stored.item.filter, description: { place: stored.item.place } }),
          stored.item
        );
        res.category = Category.create(stored.item.category);
        return res;
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
