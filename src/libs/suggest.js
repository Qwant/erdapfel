import nconf from '@qwant/nconf-getter';
import { navTo } from 'src/proxies/app_router';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Poi from 'src/adapters/poi/poi';
import Category from 'src/adapters/category';
import Intention from 'src/adapters/intention';
import { toUrl } from 'src/libs/pois';
import Telemetry from 'src/libs/telemetry';
import { suggestResults } from 'src/adapters/suggest_sources';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;

export const selectItem = (selectedItem, { query, replaceUrl = false } = {}) => {
  if (selectedItem instanceof Poi) {
    navTo(
      `/place/${toUrl(selectedItem)}`,
      {
        poi: selectedItem,
        centerMap: true,
        query,
      },
      { replace: replaceUrl }
    );
  } else if (selectedItem instanceof Category) {
    navTo(`/places/?type=${selectedItem.name}`, {}, { replace: replaceUrl });
  } else if (selectedItem instanceof Intention) {
    Telemetry.add(Telemetry.SUGGEST_SELECTION, {
      item: 'intention',
      category: selectedItem.category ? selectedItem.category.name : null,
      has_full_text_query: !!selectedItem.fullTextQuery,
      has_place: !!selectedItem.place,
    });
    navTo(`/places/${selectedItem.toQueryString()}`, {}, { replace: replaceUrl });
  } else if (!selectedItem) {
    navTo(`/noresult/?q=${query}`, {}, { replace: replaceUrl });
  }
};

export const getInputValue = item => {
  if (item instanceof Category) {
    return item.getInputValue();
  }
  if (item instanceof Intention) {
    if (item.category) {
      return item.category.getInputValue();
    }
    return item.fullTextQuery;
  }
  if (item.type === 'latlon' && item.address?.street) {
    return item.address.street;
  }
  if (item.name) {
    return item.name;
  }
  return '';
};

export const fetchSuggests = (query, options = {}) =>
  suggestResults(query, {
    withCategories: options.withCategories ?? false,
    useFocus: options.useFocus ?? true,
    maxItems: options.maxItems ?? SUGGEST_MAX_ITEMS,
    maxFavorites: options.maxFavorites ?? (!query ? 5 : 2),
  });

export const modifyList = (items, withGeoloc, query) => {
  if (withGeoloc) {
    items.splice(0, 0, NavigatorGeolocalisationPoi.getInstance());
  }

  if (query.length > 0 && (items.length === 0 || (items.length === 1 && withGeoloc))) {
    items.push({
      errorLabel: true,
    });
  }

  return items;
};
