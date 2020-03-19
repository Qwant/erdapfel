/* global _ */
import React, { Fragment } from 'react';
import Autocomplete from '../vendors/autocomplete';
import PoiStore from './poi/poi_store';
import Category from './category';
import nconf from '@qwant/nconf-getter';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import renderStaticReact from 'src/libs/renderStaticReact';
import SuggestItem from 'src/components/SuggestItem';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

import { suggestResults } from './suggest_sources';

export default class Suggest {
  constructor({ tagSelector, onSelect,
    withGeoloc = false, withCategories = false, menuClass = '',
  }) {
    this.searchInputDomHandler = document.querySelector(tagSelector);
    this.poi = null;
    this.suggestList = [];
    this.pending = false;
    this.onSelect = onSelect;

    this.autocomplete = new Autocomplete({
      selector: tagSelector,
      minChars: 0,
      delay: 100,
      menuClass,
      width: '650px',
      updateData: items => {
        this.suggestList = items;
        this.pending = false;
      },
      source: term => suggestResults(term, {
        withCategories,
        useFocus: SUGGEST_USE_FOCUS,
        focusMinZoom: SUGGEST_FOCUS_MIN_ZOOM,
      }),

      renderItems: (pois, query) => {
        const favorites = pois.filter(poi => poi instanceof PoiStore);
        const categories = pois.filter(poi => poi instanceof Category).slice(0, 1);
        const geocoderResults = pois.filter(poi => {
          return !favorites.find(fav => fav.id === poi.id) && !categories.includes(poi);
        });

        const nbDisplayedFavorites = Math.min(favorites.length, !query ? 5 : 2);
        const nbDisplayedGeocoder = SUGGEST_MAX_ITEMS - nbDisplayedFavorites - categories.length;

        let suggestItems = [];
        if (withGeoloc) {
          suggestItems.push(NavigatorGeolocalisationPoi.getInstance());
        }
        suggestItems = suggestItems.concat(categories);
        suggestItems = suggestItems.concat(geocoderResults.slice(0, nbDisplayedGeocoder));
        if (nbDisplayedFavorites > 0) {
          suggestItems.push({ simpleLabel: _('FAVORITES', 'autocomplete') });
          suggestItems = suggestItems.concat(favorites.slice(0, nbDisplayedFavorites));
        }

        return renderStaticReact(
          <Fragment>
            {suggestItems.map((item, index) => <SuggestItem item={item} key={index} />)}
          </Fragment>
        );
      },

      onSelect: (e, term, item, items = []) => {
        e.preventDefault();
        const itemId = item.getAttribute('data-id');
        const selectedItem = itemId === 'geolocalisation'
          ? NavigatorGeolocalisationPoi.getInstance()
          : items.find(item => item.id === itemId);
        this.onSelect(selectedItem);
        this.searchInputDomHandler.blur();
      },
    });

    this.searchInputDomHandler.onkeydown = event => {
      if (event.keyCode !== 13) { /* prevent enter key */
        this.pending = true;
      }
    };
  }

  async preselect(term) {
    const suggestList = await this.autocomplete.prefetch(term);
    if (suggestList && suggestList.length > 0) {
      const firstPoi = suggestList[0];
      this.onSelect(firstPoi);
      this.searchInputDomHandler.blur();
    }
    return suggestList;
  }

  setIdle(idle) {
    this.searchInputDomHandler.readOnly = idle;
  }

  async onSubmit() {
    if (this.pending) {
      const term = this.searchInputDomHandler.value;
      this.preselect(term);
    } else {
      if (this.suggestList && this.suggestList.length > 0 &&
          this.searchInputDomHandler.value &&
          this.searchInputDomHandler.value.length > 0) {
        this.onSelect(this.suggestList[0]);
        this.searchInputDomHandler.blur();
      }
    }
  }

  destroy() {
    this.autocomplete.destroy();
  }

  preRender(items) {
    this.autocomplete.preRender(items);
  }

  getValue() {
    return this.autocomplete.getValue();
  }

  setValue(value) {
    this.autocomplete.setValue(value);
    this.preRender();
  }

  clear() {
    this.autocomplete.clear();
  }
}

