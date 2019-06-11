import Panel from '../libs/panel';
import CategoryPanelView from '../views/category_panel.dot';
import MinimalHourPanel from './poi_bloc/opening_minimal';
import UrlState from '../proxies/url_state';
import IdunnPoi from '../adapters/poi/idunn_poi';
import SearchInput from '../ui_components/search_input';
import Telemetry from '../libs/telemetry';
import layouts from './layouts.js';
import debounce from '../libs/debounce';
import poiSubClass from '../mapbox/poi_subclass';
import {sources} from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

export default class CategoryPanel {
  constructor() {
    this.minimalHourPanel = new MinimalHourPanel();
    this.panel = new Panel(this, CategoryPanelView);

    this.pois = [];
    this.categoryName = '';
    this.active = false;
    this.poiSubClass = poiSubClass;
    this.PoiMarkers = [];
    this.loading = false;
    this.query = '';
    this.dataSource = '';

    UrlState.registerResource(this, 'places');
    PanelManager.register(this);

    listen('map_moveend', debounce( function() {
      if (this.active) {
        this.search();
      }
    }, 300, this));

    listen('click_category_poi', poi => {
      this.selectPoi(poi);
    });

  }

  store() {
    if (this.active) {
      let params = [];
      if (this.categoryName) {
        params.push(`type=${this.categoryName}`);
      }
      if (this.query) {
        params.push(`q=${this.query}`);
      }
      if (params.length > 0) {
        return `?${params.join('&')}`;
      }
    }
    return '';
  }

  restore() {
    let getParams = new URLSearchParams(window.location.search);
    let category = getParams.get('type') || '';
    let query = getParams.get('q') || '';
    let rawBbox = (getParams.get('bbox') || '').split(',');
    let bbox;
    if (rawBbox.length === 4) {
      bbox = [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
    }

    if (category || query) {
      this.categoryName = category;
      this.query = query;
      window.execOnMapLoaded(() => {
        if (bbox) {
          window.map.mb.fitBounds(bbox, {animate: false});
        }
        this.open();
      });
    }
  }

  async search() {
    this.loading = true;
    let bbox = window.map.bbox();
    let urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map((cardinal) => cardinal.toFixed(7))
      .join(',');

    let {places, source} = await IdunnPoi.poiCategoryLoad(urlBBox, MAX_PLACES, this.categoryName, this.query);
    this.pois = places;
    this.dataSource = source;
    this.loading = false;

    this.panel.update();
    let container = document.querySelector('.category__panel__scroll');
    if (container){
      container.scrollTop = 0;
    }

    this.addCategoryMarkers();
    fire('save_location');

    document.querySelector('.service_panel').classList.remove('service_panel--active');
  }

  async open(options = {}) {
    if (options.category) {
      const { name, label } = options.category;
      Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, {category: name});
      this.categoryName = name;
      this.query = '';
      SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1));
    }
    this.active = true;
    UrlState.pushUrl();

    if (window.map.mb.isMoving()){
      /*
        Do not trigger API search and zoom change when the map
        is already moving, to avoid flickering.
        The search will be triggered on moveend.
      */
      return;
    }

    // Apply correct zoom when opening a category
    let currentZoom = window.map.mb.getZoom();

    // Zoom < 5: focus on Paris
    if (currentZoom < 5){
      window.map.mb.flyTo({center: [2.35, 48.85], zoom: 12});
    } else if (currentZoom < 12){ // Zoom < 12: zoom up to zoom 12
      window.map.mb.flyTo({zoom: 12});
    } else if (currentZoom > 16){ // Zoom > 16: dezoom to zoom 16
      window.map.mb.flyTo({zoom: 16});
    } else {
      this.search();
      await this.panel.update();
    }
  }

  close(toggleMarkers = true) {
    SearchInput.unMinify();
    document.querySelector('.top_bar').classList.remove('top_bar--category-open');
    this.active = false;
    this.query = '';
    this.panel.update();
    UrlState.pushUrl();
    if (toggleMarkers) {
      this.removeCategoryMarkers();
    }
  }

  showPhoneNumber(options) {
    var poi = options.poi;
    var i = options.i;
    if (poi.meta && poi.meta.source) {
      Telemetry.add('phone', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'phone',
          category: this.categoryName,
        })
      );
    }
    document.querySelector('#category__panel__phone_hidden_' + i).style.display = 'none';
    document.querySelector('#category__panel__phone_revealed_' + i).style.display = 'inline';
  }

  closeAction() {
    SearchInput.setInputValue('');
    PanelManager.resetLayout();
  }

  addCategoryMarkers(){
    fire('add_category_markers', this.pois);
  }

  removeCategoryMarkers(){
    fire('remove_category_markers', this.pois);
  }

  selectPoi(poi){
    fire('fit_map', poi, layouts.LIST);
    if (poi.meta && poi.meta.source) {
      Telemetry.add('open', 'poi', poi.meta.source,
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'item',
          category: this.categoryName,
        })
      );
    }
    this.close(false);
    PanelManager.loadPoiById(poi.id, {isFromList: true, list: this});
    this.highlightPoiMarker(poi);
  }

  highlightPoiMarker(poi){
    let marker = document.getElementById(poi.marker_id);
    if (marker) {
      marker.classList.add('active');
    }
  }

  unhighlightPoiMarker(poi){
    let marker = document.getElementById(poi.marker_id);
    if (marker) {
      marker.classList.remove('active');
    }
  }

  isSourcePagesjaunes(){
    return this.dataSource === sources.pagesjaunes;
  }
}
