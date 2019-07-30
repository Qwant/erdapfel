/*
Really quick url router implementation.
Sufficient to replace the horrible "URL shard" system
and ensure the app state is consistent.
*/

// @TODO: manage the base url

function getMatchingRouteDefinition(routeDefs, url) {
  return routeDefs.find(route => new RegExp(route.match).test(url));
}

function applyRoute(routeDef, url) {
  const [ , arg ] = new RegExp(routeDef.match).exec(url);
  routeDef.render(arg);
}

export default class Router {
  constructor() {
    this.routeDefs = [];
  }

  addRoute(urlRegexp, renderCallback) {
    this.routeDefs.push({
      match: urlRegexp,
      render: renderCallback,
    });
  }

  routeUrl(url) {
    const routeDef = getMatchingRouteDefinition(this.routeDefs, url);
    if (!routeDef) {
      return;
    }
    applyRoute(routeDef, url);
  }
}
