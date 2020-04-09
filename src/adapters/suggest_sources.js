import PoiStore from './poi/poi_store';
import { getGeocoderSuggestions } from 'src/adapters/geocoder';
import CategoryService from './category_service';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Intention from './intention';

// @TODO: Improvement: don't access directly to window.map
function getFocus(focusMinZoom) {
  const zoom = window.map && window.map.mb && window.map.mb.getZoom();
  if (zoom >= focusMinZoom) {
    const { lat, lng: lon } = window.map.mb.getCenter();
    return { lat, lon, zoom };
  }
  return {};
}

function intentionsOrCategories(intentions, term) {
  if (!intentions) { // no NLU activated
    return CategoryService.getMatchingCategories(term);
  }

  return intentions
    .filter(intention => intention.filter.category)
    .map(intention => new Intention(intention));
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

      try {
        const [geocoderSuggestions, favorites] =
          await Promise.all([ geocoderPromise, favoritePromise ]);

        // This case happens when this query and the underlying XHR have been aborted.
        // resolve(null) will cause the suggest to discard this response.
        if (!geocoderSuggestions) {
          return resolve(null);
        }

        const { pois, intentions } = geocoderSuggestions;
        let suggestList = [];
        if (withGeoloc) {
          suggestList.push(NavigatorGeolocalisationPoi.getInstance());
        }
        const categories = withCategories
          ? intentionsOrCategories(intentions, term).slice(0, 1)
          : [];
        const keptFavorites = favorites.slice(0, maxFavorites);
        const keptGeocoderSuggestions = pois
          .slice(0, maxItems - keptFavorites.length - categories.length);

        suggestList = suggestList.concat(
          categories,
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

