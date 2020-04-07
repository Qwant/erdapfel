import PoiStore from './poi/poi_store';
import { getGeocoderSuggestions } from 'src/adapters/geocoder';
import CategoryService from './category_service';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';

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
  withGeoloc,
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
    promise = PoiStore.getAll();
  } else {
    promise = new Promise(async (resolve, reject) => {
      geocoderPromise = getGeocoderSuggestions(term, useFocus ? getFocus(focusMinZoom) : {});
      const favoritePromise = PoiStore.get(term);
      const categoryPromise = withCategories ? CategoryService.getMatchingCategories(term) : [];

      try {
        const [geocoderSuggestions, favorites, categories] =
          await Promise.all([ geocoderPromise, favoritePromise, categoryPromise ]);

        // This case happens when this query and the underlying XHR have been aborted.
        // resolve(null) will cause the suggest to discard this response.
        if (!geocoderSuggestions) {
          return resolve(null);
        }

        let suggestList = [];
        if (withGeoloc) {
          suggestList.push(NavigatorGeolocalisationPoi.getInstance());
        }
        if (categories.length > 0) {
          suggestList.push(categories[0]);
        }

        const keptFavorites = favorites.slice(0, maxFavorites);
        const keptGeocoderSuggestions = geocoderSuggestions
          .pois
          .slice(0, maxItems - keptFavorites.length - (categories.length > 0 ? 1 : 0));

        suggestList = suggestList.concat(
          keptGeocoderSuggestions,
          keptFavorites,
        );

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
