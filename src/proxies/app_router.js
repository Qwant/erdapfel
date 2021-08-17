import { createBrowserHistory } from 'history';

export const basename = window.baseUrl.replace(/\/$/, '');

export const history = createBrowserHistory({ basename }); // basename option is undocumented…

export function getAppRelativePathname() {
  return history.location.pathname.replace(new RegExp(`^${basename}`), '');
}

export function navTo(relativeUrl, state = {}, { replace } = {}) {
  if (replace) {
    history.replace(relativeUrl, state);
  } else {
    history.push(relativeUrl, state);
  }
}

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
