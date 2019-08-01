/*
Really quick url router implementation.
Sufficient to replace the horrible "URL shard" system
and ensure the app state is consistent.
*/

// @TODO: manage the base url

function getMatchingRouteDefinition(routeDefs, url) {
  return routeDefs.find(route => new RegExp(route.match).test(url));
}

function applyRoute(routeDef, url, state) {
  const [ , arg ] = new RegExp(routeDef.match).exec(url);
  routeDef.render(arg, state);
}

export default class Router {
  constructor() {
    this.routeDefs = [];
  }

  addRoute(name, urlRegexp, renderCallback) {
    this.routeDefs.push({
      name,
      match: urlRegexp,
      render: renderCallback,
    });
  }

  routeUrl(url, state) {
    const urlWithoutHash = url.split('#')[0];
    const routeDef = getMatchingRouteDefinition(this.routeDefs, urlWithoutHash);
    if (!routeDef) {
      return;
    }
    console.log(`ROUTER: render ${routeDef.name}`);
    applyRoute(routeDef, urlWithoutHash, state);
  }
}
