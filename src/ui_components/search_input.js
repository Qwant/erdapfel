
import { selectItem, fetchSuggests } from 'src/libs/suggest';
import { isMobileDevice } from 'src/libs/device';

const MAPBOX_RESERVED_KEYS = [
  'ArrowLeft', // ←
  'ArrowUp', // ↑
  'ArrowRight', // →
  'ArrowDown', // ↓
  '-', // -
  '+', // +
  '=', // =
];

const SEARCH_INPUT_ID = 'search';

export default class SearchInput {

  constructor(tagSelector) {
    this.searchInputHandle = document.querySelector(tagSelector);
    this.handleKeyboard();
    this.isEnabled = true;
  }

  /* Singleton */
  static initSearchInput(tagSelector) {
    if (window.__searchInput) {
      return window.__searchInput;
    }

    window.__searchInput = new SearchInput(tagSelector);

    window.clearSearch = () => {
      const isMobile = isMobileDevice();
      window.__searchInput.searchInputHandle.value = '';
      window.app.navigateTo('/');
      if (!isMobile || isMobile && document.activeElement.id === SEARCH_INPUT_ID) {
        setTimeout(() => {
          document.getElementById(SEARCH_INPUT_ID).focus();
        }, 0);
      }
    };

    window.submitSearch = () => {
      if (window.__searchInput.searchInputHandle.value.length > 0) {
        this.executeSearch(window.__searchInput.searchInputHandle.value);
      }
    };

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
    window.__searchInput.searchInputHandle.value = value;
  }

  static unminify() {
    document.querySelector('.top_bar').classList.remove('top_bar--small');
    window.__searchInput.isEnabled = true;
  }

  static isMinified() {
    return !window.__searchInput.isEnabled;
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
          document.getElementById(SEARCH_INPUT_ID).focus();
        }
      }
    };
  }

  static async executeSearch(query) {
    window.__searchInput.searchInputHandle.value = query;
    const results = await fetchSuggests(query, { withCategories: true });
    if (results && results.length > 0) {
      const firstResult = results[0];
      selectItem(firstResult, true);
      window.__searchInput.searchInputHandle.blur();
    }
  }
}
