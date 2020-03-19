/* global _ */

import Autocomplete from '../vendors/autocomplete';
import IconManager from '../adapters/icon_manager';
import ExtendedString from '../libs/string';
import PoiStore from './poi/poi_store';
import Category from './category';
import nconf from '@qwant/nconf-getter';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';

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
        const nbDisplayedFavorites = Math.min(favorites.length, !query ? 5 : 2);
        const categories = pois.filter(poi => poi instanceof Category).slice(0, 1);
        const geocoderResults = pois.filter(poi => {
          return !favorites.find(fav => fav.id === poi.id) && !categories.includes(poi);
        }).slice(0, SUGGEST_MAX_ITEMS - nbDisplayedFavorites - categories.length);

        let suggestDom = '';
        if (withGeoloc) {
          suggestDom += NavigatorGeolocalisationPoi.getInstance().render();
        }
        suggestDom += this.categoriesRender(categories);
        suggestDom += this.geocoderResultsRender(geocoderResults);
        suggestDom += this.favoritesRender(favorites.slice(0, nbDisplayedFavorites));

        return suggestDom;
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

  geocoderResultsRender(pois) {
    return pois.map(poi => this.renderItem(poi)).join('');
  }

  categoriesRender(categories) {
    return categories.map(category => this.renderCategory(category)).join('');
  }

  favoritesRender(pois) {
    if (pois.length === 0) {
      return '';
    }
    return `
      <h3 class="autocomplete_suggestion__category_title" onmousedown="return false;">
        ${_('FAVORITES', 'autocomplete')}
      </h3>
      ${pois.map(poi => this.renderItem(poi)).join('')}`;
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

  /* select sub template */
  renderItem(poi) {
    const { id, name, className, subClassName, type, alternativeName } = poi;
    const icon = IconManager.get({ className, subClassName, type });
    const klass = `autocomplete-icon ${`icon icon-${icon.iconClass}`}`;
    const iconDom = `<div style="color:${icon ? icon.color : ''}" class="${klass}"></div>`;

    return `
      <div class="autocomplete_suggestion"
           data-id="${id}" data-val="${ExtendedString.htmlEncode(poi.getInputValue())}">
        ${iconDom}
        ${this.renderLines(name, alternativeName)}
      </div>`;
  }

  renderCategory(category) {
    const { label, alternativeName, color, backgroundColor } = category;
    const icon = category.getIcon();
    const style = `color: ${color}; background: ${backgroundColor}`;
    const klass = `autocomplete-icon autocomplete-icon-rounded ${`icon icon-${icon.iconClass}`}`;
    const iconDom = `<div style="${style}" class="${klass}"></div>`;
    const categoryLabel = ExtendedString.htmlEncode(category.label);

    return `
      <div class="autocomplete_suggestion autocomplete_suggestion--category"
        data-id="${category.id}" data-val="${categoryLabel}">
        ${iconDom}
        ${this.renderLines(label, alternativeName)}
      </div>`;
  }

  renderLines(firstLabel, secondLabel) {
    const s_firstLabel = ExtendedString.htmlEncode(firstLabel);
    const s_secondLabel = ExtendedString.htmlEncode(secondLabel ? secondLabel : '');
    return `
      <div class="autocomplete_suggestion__lines_container">
        <div class="autocomplete_suggestion__first_line">${s_firstLabel}</div>
        <div class="autocomplete_suggestion__second_line">${s_secondLabel}</div>
      </div>`;
  }
}

