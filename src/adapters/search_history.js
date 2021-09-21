import { get, set, del } from './store';

let search_history = get('search_history') || [];

// Add a query to the list
export function save_query(q) {
  // Delete query if it's already in the list
  if (search_history.includes(q)) {
    delete_query(q);
  }

  // Put the query at the end of the array
  search_history.push(q);

  // Limit the list to the 100 last items
  if (search_history.length > 100) {
    search_history.shift();
  }

  // Serialize the list and save it in localStorage
  set('search_history', search_history);
}

// Delete a query from the list
export function delete_query(q) {
  const index = search_history.indexOf(q);
  if (index > -1) {
    search_history.splice(index, 1);
  }
  // Serialize the list and save it in localStorage
  set('search_history', search_history);
}

// Delete the whole search history
export function delete_search_history() {
  del('queries_list');
  search_history = [];
}
