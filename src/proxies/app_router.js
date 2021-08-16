import { createBrowserHistory } from 'history';

export const history = createBrowserHistory();

/**
 * Go to the previous application state using history.back()
 * If we determine history.back would exit the application, use replaceState as a fallback.
 * @param {Object} fallback
 * @param {String} fallback.relativeUrl - The relativeUrl to fallback to if history.back is unavailable
 * @param {Object} fallback.state - The state to fallback to if history.back is unavailable
 */
export function navigateBack({ relativeUrl = '/', state = {} }) {
  if (history.location.state) {
    history.goBack();
  } else {
    // Fallback to search params
    history.replace(relativeUrl, state);
  }
}

export function updateHash(hash) {
  const { pathname, search, state } = history.location;
  history.replace(`${pathname}${search}#${hash}`, state);
}
