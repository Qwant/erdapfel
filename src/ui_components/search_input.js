import Suggest from '../adapters/suggest';
import layouts from '../panel/layouts.js';
import UrlState from '../proxies/url_state';
import Poi from '../adapters/poi/poi';
import Category from '../adapters/category';

const MAPBOX_RESERVED_KEYS = [
  'ArrowLeft', // ←
  'ArrowUp', // ↑
  'ArrowRight', // →
  'ArrowDown', // ↓
  '-', // -
  '+', // +
  '=', // =
];


export default class SearchInput {

  /* Singleton */
  static initSearchInput(tagSelector) {
    if (! window.__searchInput) {
      window.__searchInput = new SearchInput(tagSelector);
      window.clearSearch = () => {
        window.__searchInput.suggest.setValue('');
        window.app.resetLayout();
        setTimeout(() => {
          document.getElementById('search').focus();
        }, 0);
      };
    }
    return window.__searchInput;
  }

  static minify() {
    document.querySelector('.top_bar').classList.add('top_bar--small');
    window.__searchInput.isEnabled = false;
    window.__searchInput.searchInputHandle.blur();
  }

  static select() {
    window.__searchInput.searchInputHandle.select();
  }

  static setInputValue(value) {
    window.__searchInput.suggest.setValue(value);
  }

  static unminify() {
    document.querySelector('.top_bar').classList.remove('top_bar--small');
    window.__searchInput.isEnabled = true;
  }

  static isMinified() {
    return !window.__searchInput.isEnabled;
  }

  constructor(tagSelector) {
    this.searchInputHandle = document.querySelector(tagSelector);
    this.handleKeyboard();
    this.suggest = new Suggest({
      tagSelector,
      withCategories: true,
      onSelect: selectedPoi => this.selectItem(selectedPoi),
    });
    this.isEnabled = true;

    UrlState.registerGet(this, 'q');
    listen('submit_autocomplete', async () => {
      this.suggest.onSubmit();
    });
  }

  handleKeyboard() {
    document.onkeydown = function(e) {
      if (MAPBOX_RESERVED_KEYS.find(key => key === e.key)) {
        return;
      }
      if (!e.shiftKey && !e.ctrlKey && e.key !== 'Enter' && !e.altKey) {
        if (document.activeElement
          && document.activeElement.tagName !== 'INPUT'
          && window.__searchInput.isEnabled) {
          document.getElementById('search').focus();
        }
      }
    };
  }

  store() {}

  async restore(fragment) {
    if (UrlState.getShardCount() === 1) {
      return await this.suggest.preselect(fragment);
    }
  }

  async selectItem(selectedItem) {
    if (selectedItem instanceof Poi) {
      window.app.loadPoiById(selectedItem.id, { layout: layouts.POI });
    } else if (selectedItem instanceof Category) {
      window.app.openCategory({category: selectedItem});
    }
  }
}
