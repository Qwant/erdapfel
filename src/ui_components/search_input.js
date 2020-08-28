
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

    window.clearSearch = e => {
      e.preventDefault(); // Prevent losing focus
      const inputElement = document.querySelector(tagSelector);
      const isMobile = isMobileDevice();
      const isActive = document.activeElement.id === inputElement.id;
      inputElement.value = '';

      if (!isMobile || isMobile && isActive) {
        // Trigger an input event to refresh Suggest's state
        inputElement.dispatchEvent(new Event('input'));
      }

      window.app.navigateTo('/');
    };

    window.submitSearch = () => {
      if (window.__searchInput.searchInputHandle.value.length > 0) {
        this.executeSearch(window.__searchInput.searchInputHandle.value);
      }
    };

    return window.__searchInput;
  }

  static select() {
    window.__searchInput.searchInputHandle.select();
  }

  static setInputValue(value) {
    window.__searchInput.searchInputHandle.value = value;
  }

  handleKeyboard() {
    document.onkeydown = e => {
      if (MAPBOX_RESERVED_KEYS.find(key => key === e.key)) {
        return;
      }
      if (!e.shiftKey && !e.ctrlKey && e.key !== 'Enter' && !e.altKey) {
        if (document.activeElement
          && document.activeElement.tagName !== 'INPUT'
          && window.__searchInput.isEnabled) {
          this.searchInputHandle.focus();
        }
      }
    };
  }

  static async executeSearch(query, { fromQueryParams } = {}) {
    window.__searchInput.searchInputHandle.value = query;
    const results = await fetchSuggests(query, { withCategories: true });
    if (results && results.length > 0) {
      const firstResult = results[0];
      selectItem(firstResult, { query, replaceUrl: true, fromQueryParams });
      window.__searchInput.searchInputHandle.blur();
    }
  }
}
