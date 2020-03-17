import PoiStore from './poi/poi_store';
import BragiPoi from './poi/bragi_poi';
import CategoryService from './category_service';

// @TODO: Improvement: don't access directly to window.map
function getFocus(focusMinZoom) {
  const zoom = window.map && window.map.mb && window.map.mb.getZoom();
  if (zoom >= focusMinZoom) {
    const { lat, lon } = window.map.mb.getCenter();
    return { lat, lon, zoom };
  }
  return {};
}

export function suggestResults(term, { withCategories, useFocus, focusMinZoom = 11 } = {}) {
  let geocoderPromise;
  let promise;
  if (term === '') {
    // Prerender Favorites on focus in empty field
    promise = PoiStore.getAll();
  } else {
    promise = new Promise(async (resolve, reject) => {
      geocoderPromise = BragiPoi.get(term, useFocus ? getFocus(focusMinZoom) : {});
      const favoritePromise = PoiStore.get(term);
      const categoryPromise = withCategories ? CategoryService.getMatchingCategories(term) : [];

      try {
        const [geocoderSuggestions, favorites, categories] =
          await Promise.all([ geocoderPromise, favoritePromise, categoryPromise ]);

        // For now don't display anything when there is no geocoder match
        if (geocoderSuggestions.length === 0) {
          return resolve([]);
        }

        const suggestList = [
          ...categories,
          ...geocoderSuggestions,
          ...favorites,
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
