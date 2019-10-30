import React from 'react';
import ReactDOM from 'react-dom';
import IdunnPoi from '../adapters/poi/idunn_poi';
import SearchInput from '../ui_components/search_input';
import debounce from '../libs/debounce';
import poiSubClass from '../mapbox/poi_subclass';
import nconf from '@qwant/nconf-getter';
import Telemetry from '../libs/telemetry';
import layouts from 'src/panel/layouts.js';
import ReactCategoryPanel from './category/CategoryPanel';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

export default class CategoryPanel {
  constructor() {
    this.pois = [];
    this.categoryName = '';
    this.active = false;
    this.poiSubClass = poiSubClass;
    this.loading = false;
    this.query = '';
    this.dataSource = '';

    listen('map_moveend', debounce( function() {
      if (this.active) {
        this.search();
      }
    }, 300, this));

    listen('click_category_poi', poi => {
      this.selectPoi(poi);
    });
  }

  restoreParams(options) {
    if (options.category) {
      const { name, label } = options.category;
      Telemetry.add(Telemetry.POI_CATEGORY_OPEN, null, null, { category: name });
      this.categoryName = name;
      SearchInput.setInputValue(label.charAt(0).toUpperCase() + label.slice(1));
    }
    this.query = options.q || '';
    const rawBbox = (options.bbox || '').split(',');
    let bbox;
    if (rawBbox.length === 4) {
      bbox = [[rawBbox[0], rawBbox[1]], [rawBbox[2], rawBbox[3]]];
    }

    if (bbox) {
      window.execOnMapLoaded(() => {
        window.map.mb.fitBounds(bbox, { animate: false });
      });
    }
  }

  async search() {
    this.loading = true;
    const bbox = window.map.mb.getBounds();
    const urlBBox = [bbox.getWest(), bbox.getSouth(), bbox.getEast(), bbox.getNorth()]
      .map(cardinal => cardinal.toFixed(7))
      .join(',');

    const { places, source } = await IdunnPoi.poiCategoryLoad(
      urlBBox,
      MAX_PLACES,
      this.categoryName,
      this.query
    );
    this.pois = places;
    this.dataSource = source;
    this.loading = false;

    this.renderPanel();

    this.addCategoryMarkers();
    fire('save_location');
  }

  open(options = {}) {
    this.restoreParams(options);
    this.active = true;

    if (window.map.mb.isMoving()) {
      /*
        Do not trigger API search and zoom change when the map
        is already moving, to avoid flickering.
        The search will be triggered on moveend.
      */
      return;
    }

    // Apply correct zoom when opening a category
    const currentZoom = window.map.mb.getZoom();

    // Zoom < 5: focus on Paris
    if (currentZoom < 5) {
      window.map.mb.flyTo({ center: [2.35, 48.85], zoom: 12 });
    } else if (currentZoom < 12) { // Zoom < 12: zoom up to zoom 12
      window.map.mb.flyTo({ zoom: 12 });
    } else if (currentZoom > 16) { // Zoom > 16: dezoom to zoom 16
      window.map.mb.flyTo({ zoom: 16 });
    } else {
      this.search();
    }
  }

  renderPanel() {
    const panel = <ReactCategoryPanel
      categoryName={this.categoryName}
      pois={this.pois || []}
      dataSource={this.dataSource}
      hasError={!this.pois || this.pois.length === 0}
      zoomIn={!this.pois}
      close={this.closeAction}
      selectPoi={this.selectPoi}
      highlightPoiMarker={this.highlightPoiMarker}
    />;
    ReactDOM.render(panel, document.querySelector('.react_panel__container'));
  }

  close(keepCategoryMarkers = false) {
    document.querySelector('.top_bar').classList.remove('top_bar--category-open');
    this.active = false;
    ReactDOM.unmountComponentAtNode(document.querySelector('.react_panel__container'));
    if (!keepCategoryMarkers) {
      this.removeCategoryMarkers();
    }
  }

  closeAction = () => {
    SearchInput.setInputValue('');
    window.app.navigateTo('/');
  }

  addCategoryMarkers() {
    fire('add_category_markers', this.pois);
  }

  removeCategoryMarkers() {
    fire('remove_category_markers', this.pois);
  }

  selectPoi = poi => {
    const previousMarker = document.querySelector('.mapboxgl-marker.active');
    if (previousMarker) {
      previousMarker.classList.remove('active');
    }
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
    window.app.navigateTo(`/place/${poi.toUrl()}`, {
      poi: poi.serialize(),
      isFromCategory: true,
      sourceCategory: this.categoryName,
      layout: layouts.LIST,
      centerMap: true,
    });
    this.highlightPoiMarker(poi, true);
  }

  highlightPoiMarker = (poi, highlight) => {
    const marker = document.getElementById(poi.marker_id);
    if (marker) {
      if (highlight) {
        marker.classList.add('active');
      } else {
        marker.classList.remove('active');
      }
    }
  }
}
