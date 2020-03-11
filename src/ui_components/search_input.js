import Suggest from '../adapters/suggest';
import Poi from '../adapters/poi/poi';
import Category from '../adapters/category';
import { toUrl } from 'src/libs/pois';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';

const MAPBOX_RESERVED_KEYS = [
  'ArrowLeft', // ←
  'ArrowUp', // ↑
  'ArrowRight', // →
  'ArrowDown', // ↓
  '-', // -
  '+', // +
  '=', // =
];

class SearchInputReact extends Component {
  state = {
    value: '',
  }

  inputRef = React.createRef()

  async selectItem(selectedItem, replaceUrl = false) {
    if (selectedItem instanceof Poi) {
      window.app.navigateTo(`/place/${toUrl(selectedItem)}`, {
        poi: selectedItem,
        centerMap: true,
      }, { replace: replaceUrl });
    } else if (selectedItem instanceof Category) {
      window.app.navigateTo(`/places/?type=${selectedItem.name}`,
        {}, { replace: replaceUrl });
    }

    this.setState({
      value: selectedItem.name,
    });

    this.inputRef.current.blur();
  }

  render() {
    return (
      <Suggest
        className="search_form__list"
        withCategories
        inputValue={this.state.value}
        onChange={item => this.selectItem(item, true)}
        prefixes={[]}
        input={props =>
        <>
          <input
            ref={this.inputRef}
            type="search"
            className="search_form__input"
            spellCheck="false"
            required
            placeholder="Search on Qwant Maps"
            {...props}
            id="search-react-input"
            onChange={e => {
              this.setState({ value: e.target.value });
            }}
          />
        </>
        }
      />
    );
  }
}

export default class SearchInput {

  /* Singleton */
  static initSearchInput(tagSelector) {
    console.log('initSearchInput');
    if (! window.__searchInput) {
      window.__searchInput = new SearchInput(tagSelector);
      window.clearSearch = () => {
        // window.__searchInput.suggest.setValue('');
        window.app.navigateTo('/');
        setTimeout(() => {
          // document.getElementById('search_react').focus();
          const elem = document.getElementById('search-react-input');

          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          nativeInputValueSetter.call(elem, '');

          const ev2 = new Event('input', { bubbles: true });
          elem.dispatchEvent(ev2);
          elem.focus();
        }, 0);
      };
    }

    const searchElement = document.getElementById('search');
    searchElement.remove();

    const searchReactElement = document.getElementById('search_react');
    ReactDOM.render(<SearchInputReact />, searchReactElement);

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
    const elem = document.getElementById('search-react-input');
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(elem, value);

    const ev2 = new Event('input', { bubbles: true });
    elem.dispatchEvent(ev2);
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
    this.isEnabled = true;

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
          document.getElementById('search_react').focus();
        }
      }
    };
  }
}
