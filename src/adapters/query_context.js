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

  fillHeaders(headers) {
    if (!sendQueryContextHeaders) {
      return;
    }
    if (this.position.lon !== undefined &&
        this.position.lat !== undefined &&
        this.position.zoom !== undefined) {
      const { lon, lat, zoom } = this.position;
      headers['X-QwantMaps-FocusPosition'] =
        `${Number(lon).toFixed(4)};${Number(lat).toFixed(4)};${Number(zoom).toFixed(1)}`;
    }
    headers['X-QwantMaps-Query'] = encodeURIComponent(this.term);
    headers['X-QwantMaps-SuggestionRank'] = this.ranking;
    if (this.lang !== null) {
      headers['X-QwantMaps-QueryLang'] = this.lang;
    }
  }
}
