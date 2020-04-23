/* global _ */
import React from 'react';
import ReactDOM from 'react-dom';
import Autocomplete from '../vendors/autocomplete';
import nconf from '@qwant/nconf-getter';
import PoiStore from './poi/poi_store';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

import { suggestResults } from './suggest_sources';
import SuggestsDropdown from '../components/ui/SuggestsDropdown';

export default class Suggest {
  constructor({ tagSelector, onSelect,
    withGeoloc = false, withCategories = false,
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
      updateData: items => {
        this.suggestList = items;
        this.pending = false;
      },
      source: term => suggestResults(term, {
        withCategories,
        useFocus: SUGGEST_USE_FOCUS,
        focusMinZoom: SUGGEST_FOCUS_MIN_ZOOM,
        maxFavorites: !term ? 5 : 2,
        maxItems: SUGGEST_MAX_ITEMS,
      }),
      renderItems: items => {
        const firstFav = items.findIndex(item => item instanceof PoiStore);
        if (firstFav !== -1) {
          items.splice(firstFav, 0, { simpleLabel: _('Favorites', 'autocomplete').toUpperCase() });
        }
        if (withGeoloc) {
          items.splice(0, 0, NavigatorGeolocalisationPoi.getInstance());
        }

        // Create a react node, or reuse the existing node
        const existingElem = document.getElementById('react-suggests-' + tagSelector);
        let elem = null;
        if (!existingElem) {
          elem = document.createElement('div');
          elem.setAttribute('id', 'react-suggests-' + tagSelector);
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
      },
    });

    this.searchInputDomHandler.addEventListener('blur', function handleSearchInputBlur() {
      unmountReactSuggestDropdown();
    });

    const unmountReactSuggestDropdown = () => {
      const existingElem = document.getElementById('react-suggests-' + tagSelector);
      if (existingElem) {
        ReactDOM.unmountComponentAtNode(existingElem);
        this.searchInputDomHandler.parentNode.removeChild(existingElem);
      }
    };

    this.searchInputDomHandler.onkeydown = event => {
      if (event.keyCode === 27) { // esc
        unmountReactSuggestDropdown();
      }

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

