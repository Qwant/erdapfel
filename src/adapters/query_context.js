// Used to provide information when an item from autocomplete is selected.
//
// The goal is to improve results provided by bragi based on users' selections.
export default class QueryContext {
  constructor(term, ranking, lang = null, position = {}) {
    this.term = term;
    this.ranking = ranking;
    this.lang = lang;
    // `position` field is supposed to contain `lat`, `lon` and `zoom`.
    this.position = position;
  }

  fillHeaders(headers) {
    if (this.position.lat !== undefined &&
        this.position.lon !== undefined &&
        this.position.zoom !== undefined) {
      const { lat, lon, zoom } = this.position;
      headers['X-QwantMaps-FocusPosition'] = `${lat};${lon};${zoom}`;
    }
    headers['X-QwantMaps-Query'] = encodeURI(this.term);
    headers['X-QwantMaps-SuggestionRank'] = this.ranking;
    if (this.lang !== null) {
      headers['X-QwantMaps-QueryLang'] = this.lang;
    }
  }
}
