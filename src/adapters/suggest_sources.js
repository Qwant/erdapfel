import PoiStore from './poi/poi_store';
import { getGeocoderSuggestions } from 'src/adapters/geocoder';
import CategoryService from './category_service';
import { getHistoryItems } from 'src/adapters/search_history';

// @TODO: Improvement: don't access directly to window.map
function getFocus() {
  if (window?.map?.mb) {
    const { lat, lng: lon } = window.map.mb.getCenter();
    const zoom = window.map.mb.getZoom();
    return { lat, lon, zoom };
  }
  return {};
}

export function suggestResults(
  term,
  { withCategories, useFocus, maxFavorites = 2, maxHistoryItems = 0, maxItems = 10 } = {}
) {
  let geocoderPromise;
  let promise;
  const historyItems =
    maxHistoryItems > 0
      ? getHistoryItems(term, { withIntentions: withCategories })
          .slice(0, maxHistoryItems)
          .map(item => {
            item._suggestSource = 'history';
            return item;
          })
      : [];
  if (term === '') {
    promise = Promise.resolve([...historyItems, ...PoiStore.getAll().slice(0, maxFavorites)]);
  } else {
    // eslint-disable-next-line no-async-promise-executor
    promise = new Promise(async (resolve, reject) => {
      geocoderPromise = getGeocoderSuggestions(term, {
        focus: useFocus ? getFocus() : {},
        useNlu: withCategories,
      });
      try {
        const geocoderSuggestions = await geocoderPromise;

        // This case happens when this query and the underlying XHR have been aborted.
        // resolve(null) will cause the suggest to discard this response.
        if (!geocoderSuggestions) {
          return resolve(null);
        }

        const { pois, intentions } = geocoderSuggestions;
        let intentionsOrCategories = [];
        if (withCategories) {
          if (!intentions) {
            // no NLU activated
            intentionsOrCategories = CategoryService.getMatchingCategories(term);
          } else {
            intentionsOrCategories = intentions;
          }
        }
        const favorites = PoiStore.get(term);
        const keptFavorites = favorites.slice(0, maxFavorites);

        const keptGeocoderSuggestions = pois.slice(
          0,
          maxItems - keptFavorites.length - intentionsOrCategories.length - historyItems.length
        );

        const suggestList = [
          ...historyItems,
          ...keptFavorites,
          ...intentionsOrCategories,
          ...keptGeocoderSuggestions,
        ];
        resolve(suggestList);
      } catch (e) {
        reject(e);
      }
    });
  }
  promise.abort = () => {
    if (geocoderPromise) {
      // will abort the underlying XHR
      geocoderPromise.abort();
    }
  };
  return promise;
}
