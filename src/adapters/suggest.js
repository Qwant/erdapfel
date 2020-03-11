/* global _ */

import Autocomplete from '../vendors/autocomplete';
import IconManager from '../adapters/icon_manager';
import BragiPoi from './poi/bragi_poi';
import PoiStore from './poi/poi_store';
import Category from './category';
import CategoryService from './category_service';
import nconf from '@qwant/nconf-getter';
import React, { Fragment } from 'react';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

export default class Suggest {
  constructor({ tagSelector, onSelect, prefixes = [], withCategories = false, menuClass = '' }) {
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
      menuClass,
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
          promise = new Promise(async (resolve, reject) => {
            const focus = {};
            const mapZoom = window.map && window.map.mb && window.map.mb.getZoom();
            if (SUGGEST_USE_FOCUS && mapZoom >= SUGGEST_FOCUS_MIN_ZOOM) {
              const center = window.map.mb.getCenter();
              focus.lat = center.lat;
              focus.lon = center.lng;
              focus.zoom = mapZoom;
            }
            this.historyPromise = PoiStore.get(term);
            this.bragiPromise = BragiPoi.get(term, focus);
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
        const favorites = pois.filter(poi => poi instanceof PoiStore);
        const categories = pois.filter(poi => poi instanceof Category).slice(0, 1);
        const remotes = pois.filter(poi => {
          return !favorites.find(fav => fav.id === poi.id) && !categories.includes(poi);
        });

        let nbFavorites = 0;
        if (favorites.length > 0 && favorites.length <= 2) {
          nbFavorites = favorites.length;
        } else if (favorites.length > 2) {
          nbFavorites = 2;
        }

        // // fill the suggest with the remotes poi according to the remaining places
        const remotesLen = SUGGEST_MAX_ITEMS - nbFavorites - categories.length;

        const Items = () =>
          <>
            {this.prefixesRender()}
            {this.categoriesRender(categories)}
            {this.remotesRender(remotes.slice(0, remotesLen))}
            {favorites.length > 0 &&
              this.favoritesRender(favorites.slice(0, query === '' ? 5 : nbFavorites))
            }
          </>
        ;
        return <Items />;
      },

      onSelect: (e, term, item, items = []) => {
        e.preventDefault();
        const itemId = item.getAttribute('data-id');

        const prefixPoint = this.prefixes.find(prefix => prefix.id === itemId);
        if (prefixPoint !== undefined) {
          this.onSelect(prefixPoint);
        } else {
          const selectedItem = items.find(item => item.id === itemId);
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
      if (this.bragiPromise) {
        this.bragiPromise.abort();
      }
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

  prefixesRender() {
    return (
      this.prefixes.map((prefix, index) => <Fragment key={index}>{prefix.render()}</Fragment>)
    );
  }

  remotesRender(pois) {
    return (
      <>
        {pois.map((poi, index) => <Fragment key={index}>{this.renderItem(poi)}</Fragment>)}
      </>
    );
  }

  categoriesRender(categories) {
    return (
      <>
        {categories.map((category, index) =>
          <Fragment key={index}>{this.renderCategory(category)}</Fragment>
        )}
      </>
    );
  }

  favoritesRender(pois) {
    return (
      <>
        <h3 className="autocomplete_suggestion__category_title" onMouseDown={() => false }>
          {_('FAVORITES', 'autocomplete')}
        </h3>
        {pois.map((poi, index) =>
          <Fragment key={index}>{this.renderItem(poi)}</Fragment>
        )}
      </>
    );
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
    const Icon = () => <div style={{ color: icon ? icon.color : '' }} className={klass}></div>;

    return (
      <div className="autocomplete_suggestion"
        data-id={id} data-val={poi.getInputValue()}>
        <Icon />
        {this.renderLines(name, alternativeName)}
      </div>
    );
  }

  renderCategory(category) {
    const { label, alternativeName, color, backgroundColor } = category;
    const icon = category.getIcon();
    const style = { color, backgroundColor };
    const klass = `autocomplete-icon autocomplete-icon-rounded ${`icon icon-${icon.iconClass}`}`;
    const Icon = () => <div style={style} className={klass}></div>;

    return (
      <div className="autocomplete_suggestion autocomplete_suggestion--category"
        data-id={category.id} data-val={category.label}>
        <Icon />
        {this.renderLines(label, alternativeName)}
      </div>
    );
  }

  renderLines(firstLabel, secondLabel) {
    return (
      <div className="autocomplete_suggestion__lines_container">
        <div className="autocomplete_suggestion__first_line">{firstLabel}</div>
        <div className="autocomplete_suggestion__second_line">{secondLabel}</div>
      </div>
    );
  }
}

