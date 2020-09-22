
import { selectItem, fetchSuggests } from 'src/libs/suggest';
import Telemetry from 'src/libs/telemetry';

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

    window.clearSearch = (e, blur = false) => {
      e.preventDefault(); // Prevent losing focus
      Telemetry.add(Telemetry.SUGGEST_CLEAR);
      const inputElement = document.querySelector(tagSelector);
      const isInputFocused = document.activeElement === inputElement;
      inputElement.value = '';
      const topBarHandle = document.querySelector('.top_bar');

      if (isInputFocused) {
        // Trigger an input event to refresh Suggest's state
        inputElement.dispatchEvent(new Event('input'));

        if (blur) {
          inputElement.blur();
          topBarHandle.classList.remove('top_bar--search_focus');
        }
      }

      topBarHandle.classList.remove('top_bar--search_filled');
      window.app.navigateTo('/');
    };

    window.submitSearch = () => {
      Telemetry.add(Telemetry.SUGGEST_SUBMIT);
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
      // KeyboardEvent.key is either the printed character representation or a standard value for specials keys
      // See https://developer.mozilla.org/fr/docs/Web/API/KeyboardEvent/key/Key_Values
      if (e.key.length === 1) {
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

    selectItem(
      results[0] || null,
      {
        query,
        replaceUrl: true,
        fromQueryParams,
      },
    );
    window.__searchInput.searchInputHandle.blur();
  }
}
