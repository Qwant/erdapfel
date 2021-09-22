import { get, set, del } from './store';

const SEARCH_HISTORY_KEY = 'search_history';
const HISTORY_SIZE = 100;

// Add a query to the list
export function save_query(q) {
  const searchHistory = get(SEARCH_HISTORY_KEY) || [];

  // Delete query if it's already in the list
  if (searchHistory.includes(q)) {
    delete_query(q);
  }

  // Put the query at the end of the array
  searchHistory.push(q);

  // Limit the list to the 100 last items
  if (searchHistory.length > HISTORY_SIZE) {
    searchHistory.shift();
  }

  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

// Delete a query from the list
export function delete_query(q) {
  const searchHistory = get(SEARCH_HISTORY_KEY) || [];
  const index = searchHistory.indexOf(q);
  if (index > -1) {
    searchHistory.splice(index, 1);
  }
  // Serialize the list and save it in localStorage
  set(SEARCH_HISTORY_KEY, searchHistory);
}

// Delete the whole search history
export function delete_search_history() {
  del(SEARCH_HISTORY_KEY);
}
