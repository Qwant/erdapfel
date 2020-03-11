/* global _ */

import IconManager from '../adapters/icon_manager';
import BragiPoi from './poi/bragi_poi';
import PoiStore from './poi/poi_store';
import CategoryService from './category_service';
import nconf from '@qwant/nconf-getter';
import React, { Component, Fragment } from 'react';
import Downshift from 'downshift';
import classNames from 'classnames';
import debounce from 'lodash.debounce';

const geocoderConfig = nconf.get().services.geocoder;
const SUGGEST_MAX_ITEMS = geocoderConfig.maxItems;
const SUGGEST_USE_FOCUS = geocoderConfig.useFocus;
const SUGGEST_FOCUS_MIN_ZOOM = 11;

const Poi = ({ poi, selected }) => {
  const { id, name, className, subClassName, type, alternativeName } = poi;
  const icon = IconManager.get({ className, subClassName, type });
  const klass = `autocomplete-icon ${`icon icon-${icon.iconClass}`}`;
  const Icon = () => <div style={{ color: icon ? icon.color : '' }} className={klass}></div>;

  return (
    <div className={classNames('autocomplete_suggestion', { selected })}
      data-id={id} data-val={poi.getInputValue()}>
      <Icon />
      <Lines label={name} subLabel={alternativeName} />
    </div>
  );
};

const Category = ({ category }) => {
  const { label, alternativeName, color, backgroundColor } = category;
  const icon = category.getIcon();
  const style = { color, backgroundColor };
  const klass = `autocomplete-icon autocomplete-icon-rounded ${`icon icon-${icon.iconClass}`}`;
  const Icon = () => <div style={style} className={klass}></div>;

  return (
    <div className="autocomplete_suggestion autocomplete_suggestion--category"
      data-id={category.id} data-val={category.label}>
      <Icon />
      <Lines label={label} subLabel={alternativeName} />
    </div>
  );
};

const Lines = ({ label, subLabel }) =>
  <div className="autocomplete_suggestion__lines_container">
    <div className="autocomplete_suggestion__first_line">{label}</div>
    <div className="autocomplete_suggestion__second_line">{subLabel}</div>
  </div>
;

export default class Suggest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pois: [],
      favorites: [],
      categories: [],
      isOpen: false,
    };
  }

  async componentDidMount() {
    const favorites = await PoiStore.getAll();
    this.setState({
      favorites,
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.inputValue !== prevProps.inputValue) {
      this.source(this.props.inputValue);
    }
  }

  source = debounce(async term => {
    let promise;

    if (term === '') {
      // Prerender Favorites on focus in empty field
      // console.log('should Prerender Favorites');
      // const favorites = await PoiStore.getAll();
      // console.log('favorites', favorites);
      this.setState({
        pois: [],
      });
    } else {
      promise = () => new Promise(async (resolve, reject) => {
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
        this.categoryPromise = this.props.withCategories ?
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
            // this.suggestList = this.suggestList.concat(categoryResponse);
            this.setState({
              categories: categoryResponse,
            });
          }

          this.bragiPromise = null;
          this.suggestList = this.suggestList.concat(bragiResponse);
          this.suggestList = this.suggestList.concat(storeResponse);

          resolve(this.suggestList);
        } catch (e) {
          reject(e);
        }
      });

      const pois = await promise();
      this.setState({
        pois,
      });
    }
  }, 100)

  render() {
    const { prefixes } = this.props;
    const { categories, pois, favorites } = this.state;

    return (
      <Downshift
        inputValue={this.props.inputValue}
        itemToString={item => item ? item.name : ''}
        isOpen={this.state.isOpen}
        onOuterClick={() =>
          this.setState({ isOpen: false })
        }
        onChange={value => {
          this.props.onChange(value);
          this.setState({ isOpen: false });
        }}
        selectedItem={null}
      >
        {({
          getInputProps,
          getItemProps,
          getMenuProps,
          highlightedIndex,
          getRootProps,
          inputValue,
        }) =>
          <div>
            <div
              style={{ display: 'inline-block', width: '100%' }}
              {...getRootProps({}, { suppressRefError: true })}
            >
              {this.props.input(getInputProps({
                onFocus: () => this.setState({ isOpen: true }),
              }))}
            </div>
            <ul
              {...getMenuProps()}
              className={classNames('autocomplete_suggestions', this.props.className)}
              style={{ display: 'block' }}
            >

              {this.state.isOpen && [
                ...prefixes,
                ...categories,
                ...pois,
                ...favorites.filter(item => item.name.toUpperCase().includes(inputValue.toUpperCase())),
              ].map((item, index) =>
                <li
                  key={index}
                  {...getItemProps({
                    item,
                  })}
                >
                  {undefined === item.type && item.render(highlightedIndex === index)} {/* type is undefined in prefixes */}
                  {'category' === item.type && <Category category={item} selected={highlightedIndex === index} />}
                  {['poi', 'zone'].includes(item.type) && <Poi poi={item} selected={highlightedIndex === index} />}
                </li>
              )
              }
            </ul>
          </div>
        }
      </Downshift>
    );
  }
}

