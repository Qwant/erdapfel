/* global _ */
import nconf from '@qwant/nconf-getter';

import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Poi from 'src/adapters/poi/poi';
import PoiStore from 'src/adapters/poi/poi_store';
import Category from 'src/adapters/category';
import Intention from 'src/adapters/intention';
import { toUrl } from 'src/libs/pois';
import Telemetry from 'src/libs/telemetry';
import { suggestResults } from 'src/adapters/suggest_sources';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

export const selectItem = (selectedItem, replaceUrl = false) => {
  if (selectedItem instanceof Poi) {
    window.app.navigateTo(`/place/${toUrl(selectedItem)}`, {
      poi: selectedItem,
      centerMap: true,
    }, { replace: replaceUrl });
  } else if (selectedItem instanceof Category) {
    window.app.navigateTo(`/places/?type=${selectedItem.name}`,
      {}, { replace: replaceUrl });
  } else if (selectedItem instanceof Intention) {
    Telemetry.add(
      Telemetry.SUGGEST_CLICK,
      null,
      null,
      {
        useNlu: geocoderConfig.useNlu,
        category: selectedItem.category ? selectedItem.category.name : null,
        hasFullTextQuery: !!selectedItem.fullTextQuery,
        hasPlace: !!selectedItem.place,
      }
    );
    window.app.navigateTo(`/places/${selectedItem.toQueryString()}`,
      {}, { replace: replaceUrl });
  }
};

export const fetchSuggests = (query, options = {}) =>
  suggestResults(query, {
    withCategories: options.withCategories || false,
    useFocus: options.useFocus || SUGGEST_USE_FOCUS,
    focusMinZoom: options.focusMinZoom || SUGGEST_FOCUS_MIN_ZOOM,
    maxItems: options.maxItems || SUGGEST_MAX_ITEMS,
    maxFavorites: options.maxFavorites || !query ? 5 : 2,
  });

export const modifyList = (items, withGeoloc) => {
  const firstFav = items.findIndex(item => item instanceof PoiStore);

  if (firstFav !== -1) {
    items.splice(firstFav, 0, { simpleLabel: _('Favorites', 'autocomplete').toUpperCase() });
  }

  if (withGeoloc) {
    items.splice(0, 0, NavigatorGeolocalisationPoi.getInstance());
  }

  return items;
};
