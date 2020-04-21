import PoiStore from './poi/poi_store';
import { getGeocoderSuggestions } from 'src/adapters/geocoder';
import CategoryService from './category_service';

// @TODO: Improvement: don't access directly to window.map
function getFocus(focusMinZoom) {
  const zoom = window.map && window.map.mb && window.map.mb.getZoom();
  if (zoom >= focusMinZoom) {
    const { lat, lng: lon } = window.map.mb.getCenter();
    return { lat, lon, zoom };
  }
  return {};
}

export function suggestResults(term, {
  withCategories,
  useFocus,
  focusMinZoom = 11,
  maxFavorites = 2,
  maxItems = 10,
} = {}) {
  let geocoderPromise;
  let promise;
  if (term === '') {
    // Prerender Favorites on focus in empty field
    promise = PoiStore.getAll().then(favorites => favorites.slice(0, maxFavorites));
  } else {
    promise = new Promise(async (resolve, reject) => {
      geocoderPromise = getGeocoderSuggestions(term, {
        focus: useFocus ? getFocus(focusMinZoom) : {},
        useNlu: withCategories,
      });
      const favoritePromise = PoiStore.get(term);
      try {
        const [geocoderSuggestions, favorites] =
          await Promise.all([ geocoderPromise, favoritePromise ]);

        // This case happens when this query and the underlying XHR have been aborted.
        // resolve(null) will cause the suggest to discard this response.
        if (!geocoderSuggestions) {
          return resolve(null);
        }

        const { pois, intentions } = geocoderSuggestions;
        let intentionsOrCategories = [];
        if (withCategories) {
          if (!intentions) { // no NLU activated
            intentionsOrCategories = CategoryService.getMatchingCategories(term);
          } else {
            intentionsOrCategories = intentions.filter(intention => intention.category);
          }
        }
        const keptFavorites = favorites.slice(0, maxFavorites);
        const keptGeocoderSuggestions = pois
          .slice(0, maxItems - keptFavorites.length - intentionsOrCategories.length);

        const suggestList = [
          ...intentionsOrCategories,
          ...keptGeocoderSuggestions,
          ...keptFavorites,
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

