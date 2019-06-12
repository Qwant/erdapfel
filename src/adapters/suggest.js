/* global _ */

import Autocomplete from '../vendors/autocomplete';
import IconManager from '../adapters/icon_manager';
import ExtendedString from '../libs/string';
import BragiPoi from './poi/bragi_poi';
import PoiStore from './poi/poi_store';
import Category from './category';
import CategoryService from './category_service';
import nconf from '@qwant/nconf-getter';

const SUGGEST_MAX_ITEMS = nconf.get().services.geocoder.max_items;

export default class Suggest {
  constructor({tagSelector, onSelect, prefixes = [], withCategories = false, menuClass = ''}) {
    this.searchInputDomHandler = document.querySelector(tagSelector);
    this.poi = null;
    this.bragiPromise = null;
    this.historyPromise = null;
    this.suggestList = [];
    this.pending = false;
    this.onSelect = onSelect;

    this.prefixes = prefixes;

    this.autocomplete = new Autocomplete({
      selector: tagSelector,
      minChars: 0,
      cachePrefix: false,
      delay: 100,
      menuClass: menuClass,
      width: '650px',
      updateData: items => {
        this.suggestList = items;
        this.pending = false;
      },
      source: term => {
        let promise;
        if (term === '') {
          // Prerender Favorites on focus in empty field
          promise = PoiStore.getAll();
        } else {
          promise = new Promise(async(resolve, reject) => {
            this.historyPromise = PoiStore.get(term);
            this.bragiPromise = BragiPoi.get(term);
            this.categoryPromise = withCategories ?
              CategoryService.getMatchingCategories(term) : null;

            try {
              const [bragiResponse, storeResponse, categoryResponse] = await Promise.all([
                this.bragiPromise, this.historyPromise, this.categoryPromise,
              ]);

              if (!bragiResponse) {
                return resolve(null);
              }

              this.suggestList = [];

              if (categoryResponse) {
                this.suggestList = this.suggestList.concat(categoryResponse);
              }

              this.bragiPromise = null;
              this.suggestList = this.suggestList.concat(bragiResponse);
              this.suggestList = this.suggestList.concat(storeResponse);

              resolve(this.suggestList);
            } catch (e) {
              reject(e);
            }
          });
        }
        promise.abort = () => {
          this.bragiPromise.abort();
        };
        return promise;
      },

      renderItems: (pois, query) => {
        let favorites = pois.filter(poi => poi instanceof PoiStore);
        let categories = pois.filter(poi => poi instanceof Category).slice(0, 1);
        let remotes = pois.filter(poi => {
          return !favorites.find(fav => fav.id === poi.id) && !categories.includes(poi);
        });
        let suggestDom = this.prefixesRender();

        var nbFavorites = 0;
        if (favorites.length > 0 && favorites.length <= 2) {
          nbFavorites = favorites.length;
        } else if (favorites.length > 2) {
          nbFavorites = 2;
        }

        suggestDom += this.categoriesRender(categories);

        // fill the suggest with the remotes poi according to the remaining places
        const remotesLen = SUGGEST_MAX_ITEMS - nbFavorites - categories.length;
        suggestDom += this.remotesRender(remotes.slice(0, remotesLen));

        if (favorites.length > 0) {
          suggestDom += this.favoritesRender(favorites.slice(0, query === '' ? 5 : nbFavorites));
        }

        return suggestDom;
      },

      onSelect: (e, term, item, items = []) => {
        e.preventDefault();
        const itemId = item.getAttribute('data-id');

        let prefixPoint = this.prefixes.find(prefix => prefix.id === itemId);
        if (prefixPoint !== undefined) {
          this.onSelect(prefixPoint);
        } else {
          let selectedItem = items.find(item => item.id === itemId);
          this.onSelect(selectedItem);
        }
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
    let suggestList = await this.autocomplete.prefetch(term);
    if (suggestList && suggestList.length > 0) {
      let firstPoi = suggestList[0];
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
      if (this.bragiPromise) {
        this.bragiPromise.abort();
      }
      let term = this.searchInputDomHandler.value;
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

  prefixesRender() {
    return this.prefixes.map(prefix => prefix.render());
  }

  remotesRender(pois) {
    return pois.map(poi => this.renderItem(poi)).join('');
  }

  categoriesRender(categories) {
    if (!categories) {
      return '';
    }

    return categories.map(category => this.renderCategory(category)).join('');
  }

  favoritesRender(pois) {
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
    const {id, name, fromHistory, className, subClassName, type, alternativeName} = poi;
    const icon = IconManager.get({className: className, subClassName: subClassName, type: type});
    const klass = `autocomplete-icon ${`icon icon-${icon.iconClass}`}`;
    const iconDom = `<div style="color:${icon ? icon.color : ''}" class="${klass}"></div>`;

    return `
      <div class="autocomplete_suggestion${fromHistory ? ' autocomplete_suggestion--history' : ''}"
           data-id="${id}" data-val="${ExtendedString.htmlEncode(poi.getInputValue())}">
        ${this.renderLines(iconDom, name, alternativeName)}
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
      <div class="autocomplete_suggestion" data-id="${category.id}" data-val="${categoryLabel}">
        ${this.renderLines(iconDom, label, alternativeName)}
      </div>`;
  }

  renderLines(iconDom, firstLabel, secondLabel) {
    const s_firstLabel = ExtendedString.htmlEncode(firstLabel);
    const s_secondLabel = ExtendedString.htmlEncode(secondLabel ? secondLabel : '');
    return `
      <div class="autocomplete_suggestion__first_line__container">
        ${iconDom}
        <div class="autocomplete_suggestion__first_line">${s_firstLabel}</div>
      </div>
      <div class="autocomplete_suggestion__second_line">${s_secondLabel}</div>`;
  }
}

