import nconf from '@qwant/nconf-getter';

const sendQueryContextHeaders = nconf.get().telemetry.sendQueryContextHeaders;

// Used to provide information when an item from autocomplete is selected.
//
// The goal is to improve results provided by bragi based on users' selections.
export default class QueryContext {
  constructor(term, ranking, lang = null, position = {}) {
    this.term = term;
    this.ranking = ranking;
    this.lang = lang;
    // `position` field is supposed to contain `lon`, `lat` and `zoom`.
    this.position = position;
  }

  static toHeaders(queryContext) {
    if (!sendQueryContextHeaders || !queryContext) {
      return {};
    }
    const headers = {};
    const { term, ranking, lang, position } = queryContext;
    if (position.lon !== undefined &&
        position.lat !== undefined &&
        position.zoom !== undefined) {
      const { lon, lat, zoom } = position;
      headers['X-QwantMaps-FocusPosition'] =
        `${Number(lon).toFixed(4)};${Number(lat).toFixed(4)};${Number(zoom).toFixed(1)}`;
    }
    headers['X-QwantMaps-Query'] = encodeURIComponent(term);
    headers['X-QwantMaps-SuggestionRank'] = ranking;
    if (lang !== null) {
      headers['X-QwantMaps-QueryLang'] = lang;
    }
    return headers;
  }
}
