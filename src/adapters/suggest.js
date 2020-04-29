/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import nconf from '@qwant/nconf-getter';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';

import PoiStore from './poi/poi_store';
import Autocomplete from '../vendors/autocomplete';
import { suggestResults } from './suggest_sources';
import SuggestsDropdown from '../components/ui/SuggestsDropdown';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;


export default class Suggest {

  constructor({
    tagSelector,
    onSelect,
    withGeoloc = false,
    withCategories = false,
  }) {

    this.tagSelector = tagSelector;
    this.onSelect = onSelect;
    this.withGeoloc = withGeoloc;
    this.withCategories = withCategories;

    this.searchInputDomHandler = document.querySelector(tagSelector);

    this.autocomplete = new Autocomplete({
      selector: tagSelector,
      minChars: 0,
      delay: 100,
      source: term => this.suggestResults(term),
      renderItems: items => this.renderItems(items),
    });

    this.searchInputDomHandler.addEventListener('blur', () => {
      this.unmountReactSuggestDropdown();
    });

    this.searchInputDomHandler.onkeydown = event => {
      if (event.keyCode === 27) { // esc
        this.unmountReactSuggestDropdown();
      }
    };
  }

  suggestResults = term =>
    suggestResults(term, {
      withCategories: this.withCategories,
      useFocus: SUGGEST_USE_FOCUS,
      focusMinZoom: SUGGEST_FOCUS_MIN_ZOOM,
      maxItems: SUGGEST_MAX_ITEMS,
      maxFavorites: !term ? 5 : 2,
    });

  renderItems = items => {
    const firstFav = items.findIndex(item => item instanceof PoiStore);

    if (firstFav !== -1) {
      items.splice(firstFav, 0, { simpleLabel: _('Favorites', 'autocomplete').toUpperCase() });
    }

    if (this.withGeoloc) {
      items.splice(0, 0, NavigatorGeolocalisationPoi.getInstance());
    }

    this.mountReactSuggestDropdown(items);
  }

  mountReactSuggestDropdown = items => {
    // Create a react node, or reuse the existing node
    const existingElem = document.getElementById('react-suggests-' + this.tagSelector);
    let elem = null;
    if (!existingElem) {
      elem = document.createElement('div');
      elem.setAttribute('id', 'react-suggests-' + this.tagSelector);
      this.searchInputDomHandler.parentNode.appendChild(elem);
    }

    const reactElem = existingElem || elem;
    const typedValue = this.searchInputDomHandler.value;

    ReactDOM.render(
      <SuggestsDropdown
        inputId={this.searchInputDomHandler.getAttribute('id')}
        suggestItems={items}
        onHighlight={item => {
          this.searchInputDomHandler.value = item && item.name || typedValue;
        }}
        onSelect={item => {
          this.searchInputDomHandler.value = item.name || '';
          this.searchInputDomHandler.blur();
          this.onSelect(item);
        }}
      />
      , reactElem
    );
  }

  unmountReactSuggestDropdown = () => {
    const existingElem = document.getElementById('react-suggests-' + this.tagSelector);
    if (existingElem) {
      ReactDOM.unmountComponentAtNode(existingElem);
      this.searchInputDomHandler.parentNode.removeChild(existingElem);
    }
  };

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
    const term = this.searchInputDomHandler.value;
    this.preselect(term);
  }

  destroy() {
    this.autocomplete.destroy();
  }

  preRender(items) {
    this.autocomplete.preRender(items);
  }

  setValue(value) {
    this.autocomplete.setValue(value);
    this.preRender();
  }

  clear() {
    this.autocomplete.clear();
  }
}

