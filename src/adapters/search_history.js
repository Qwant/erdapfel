import { get, set, del } from './store';

const SEARCH_HISTORY_KEY = 'search_history';
const HISTORY_SIZE = 100;

// Add a query to the list
export function saveQuery(item) {
  // ignore intention objects for now
  if (!item.id) {
    return;
  }

  // Delete query if it's already in the list
  deleteQuery(item);

  // Retrieve the search history
  let searchHistory = get(SEARCH_HISTORY_KEY) || [];

  // Put the query at the end of the array
  searchHistory.push(item);

  // Limit the list to the last items
  if (searchHistory.length > HISTORY_SIZE) {
    searchHistory = searchHistory.slice(-HISTORY_SIZE);
  }

  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

// Delete a query from the list
export function deleteQuery(item) {
  const searchHistory = get(SEARCH_HISTORY_KEY) || [];
  const index = searchHistory.findIndex(storedItem => item.id === storedItem.id);
  if (index === -1) {
    return;
  }
  searchHistory.splice(index, 1);
  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

// Delete the whole search history
export function deleteSearchHistory() {
  del(SEARCH_HISTORY_KEY);
}
