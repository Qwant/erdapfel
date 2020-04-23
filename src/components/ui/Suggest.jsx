/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import nconf from '@qwant/nconf-getter';
import PoiStore from 'src/adapters/poi/poi_store';
import NavigatorGeolocalisationPoi from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import throttle from 'lodash.throttle';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

import { suggestResults } from 'src/adapters/suggest_sources';
import SuggestsDropdown from 'src/components/ui/SuggestsDropdown';

// TODO: functional/unmutable
const modifyList = (items, withGeoloc) => {
  const firstFav = items.findIndex(item => item instanceof PoiStore);
  if (firstFav !== -1) {
    items.splice(firstFav, 0, { simpleLabel: _('Favorites', 'autocomplete').toUpperCase() });
  }
  if (withGeoloc) {
    items.splice(0, 0, NavigatorGeolocalisationPoi.getInstance());
  }
  return items;
};

export default class Suggest extends React.Component {
  static propTypes = {
    tagSelector: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    withGeoloc: PropTypes.bool,
    withCategories: PropTypes.bool,
    minChars: PropTypes.number,
    className: PropTypes.string,
  };

  static defaultProps = {
    minChars: 0,
  }

  state = {
    typedValue: '',
    items: [],
    isOpen: false,
    isFetching: false,
  }

  componentDidMount() {
    this.searchInputDomHandler = document.querySelector(this.props.tagSelector);
    this.attachEvents();
  }

  componentWillUnmount() {
    // TODO: detach events
  }

  attachEvents = () => {
    console.log(this.searchInputDomHandler);
    this.searchInputDomHandler.addEventListener('blur', () => {
      this.setState({ isOpen: false });
    });
    this.searchInputDomHandler.addEventListener('focus', () => {
      this.setState({ isOpen: true });
    });
    this.searchInputDomHandler.addEventListener('input', event => {
      this.onInputChange(event.target.value);
    });
    this.searchInputDomHandler.addEventListener('keydown', event => {
      // TODO: put Dropdown events here
      if (event.keyCode === 27) { // esc
        this.setState({ isOpen: false });
      }
      if (event.keyCode === 13) {
        this.onSubmit();
      }
    });
    this.searchInputDomHandler.addEventListener('submit', this.onSubmit);
  }

  // TODO: wait when pending
  onSubmit = () => {
    this.onSelectItem(this.state.items[0]);
  }

  onHighlightItem = item => {
    this.searchInputDomHandler.value = item && item.name || this.state.typedValue;
  }

  onSelectItem = item => {
    if (!item) {
      return;
    }
    this.searchInputDomHandler.value = item.name || '';
    this.searchInputDomHandler.blur();
    this.props.onSelect(item);
  }

  onInputChange = throttle(typedValue => {
    console.log('input change', typedValue);
    this.setState({ typedValue, isFetching: true });
    if (this.lastQuery) {
      this.lastQuery.abort();
    }
    this.lastQuery = suggestResults(typedValue, {
      withCategories: this.props.withCategories,
      useFocus: SUGGEST_USE_FOCUS,
      focusMinZoom: SUGGEST_FOCUS_MIN_ZOOM,
      maxFavorites: !typedValue ? 5 : 2,
      maxItems: SUGGEST_MAX_ITEMS,
    });
    this.lastQuery
      .then(suggestions => modifyList(suggestions, this.props.withGeoloc))
      .then(items => { this.setState({ items, isOpen: true, isFetching: false }); })
      .catch(() => { /* Query aborted. Just ignore silently */ });
  }, 100);

  render() {
    if (!this.searchInputDomHandler || !this.state.isOpen) {
      return null;
    }

    return <SuggestsDropdown
      inputId={this.searchInputDomHandler.getAttribute('id')}
      suggestItems={this.state.items}
      onHighlight={this.onHighlightItem}
      onSelect={this.onSelectItem}
      className={this.props.className}
    />;
  }

  // _constructor({ tagSelector, onSelect, withGeoloc = false, withCategories = false }) {
  //   this.searchInputDomHandler = document.querySelector(tagSelector);
  //   this.suggestList = [];
  //   this.pending = false;
  //   this.onSelect = onSelect;

  //   this.autocomplete = new Autocomplete({
  //     selector: tagSelector,
  //     minChars: 0,
  //     delay: 100,
  //   });

  //   const unmountReactSuggestDropdown = () => {
  //     const existingElem = document.getElementById('react-suggests-' + tagSelector);
  //     if (existingElem) {
  //       ReactDOM.unmountComponentAtNode(existingElem);
  //       this.searchInputDomHandler.parentNode.removeChild(existingElem);
  //     }
  //   };

  //   this.searchInputDomHandler.onkeydown = event => {
  //     if (event.keyCode === 27) { // esc
  //       unmountReactSuggestDropdown();
  //     }

  //     if (event.keyCode !== 13) { /* prevent enter key */
  //       this.pending = true;
  //     }
  //   };
  // }

  // async preselect(term) {
  //   const suggestList = await this.autocomplete.prefetch(term);
  //   if (suggestList && suggestList.length > 0) {
  //     const firstPoi = suggestList[0];
  //     this.onSelect(firstPoi);
  //     this.searchInputDomHandler.blur();
  //   }
  //   return suggestList;
  // }

  // setIdle(idle) {
  //   this.searchInputDomHandler.readOnly = idle;
  // }

  // async onSubmit() {
  //   if (this.pending) {
  //     const term = this.searchInputDomHandler.value;
  //     this.preselect(term);
  //   } else {
  //     if (this.suggestList && this.suggestList.length > 0 &&
  //         this.searchInputDomHandler.value &&
  //         this.searchInputDomHandler.value.length > 0) {
  //       this.onSelect(this.suggestList[0]);
  //       this.searchInputDomHandler.blur();
  //     }
  //   }
  // }

  // destroy() {
  //   this.autocomplete.destroy();
  // }

  // preRender(items) {
  //   this.autocomplete.preRender(items);
  // }

  // getValue() {
  //   return this.autocomplete.getValue();
  // }

  // setValue(value) {
  //   this.autocomplete.setValue(value);
  //   this.preRender();
  // }

  // clear() {
  //   this.autocomplete.clear();
  // }
}

