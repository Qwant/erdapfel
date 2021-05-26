/*
Really quick url router implementation.
Sufficient to replace the horrible "URL shard" system
and ensure the app state is consistent.
*/
import { joinPath } from 'src/libs/url_utils';
import { fire } from 'src/libs/customEvents';
import { createBrowserHistory } from 'history';

function getMatchingRouteDefinition(routeDefs, url) {
  return routeDefs.find(route => new RegExp(route.match).test(url));
}

function applyRoute(routeDef, url, state) {
  const [, arg] = new RegExp(routeDef.match).exec(url);
  routeDef.render(arg, state);
}

export default class Router {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.routeDefs = [];
  }

  addRoute(name, urlRegexp, renderCallback) {
    this.routeDefs.push({
      name,
      match: '^' + joinPath([this.baseUrl, urlRegexp]),
      render: renderCallback,
    });
  }

  routeUrl(url, state) {
    const urlWithoutHash = url.split('#')[0];
    fire('routeChange', urlWithoutHash);
    const routeDef = getMatchingRouteDefinition(this.routeDefs, urlWithoutHash);
    if (!routeDef) {
      return;
    }
    applyRoute(routeDef, urlWithoutHash, state);
    return routeDef;
  }
}

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
