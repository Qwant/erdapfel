import React from 'react';
import renderStaticReact from 'src/libs/renderStaticReact';
import ReviewScore from 'src/components/ReviewScore';
import Panel from '../libs/panel';
import CategoryPanelView from '../views/category_panel.dot';
import OpeningHour from 'src/components/OpeningHour';
import IdunnPoi from '../adapters/poi/idunn_poi';
import SearchInput from '../ui_components/search_input';
import Telemetry from '../libs/telemetry';
import PanelResizer from '../libs/panel_resizer';
import layouts from './layouts.js';
import debounce from '../libs/debounce';
import poiSubClass from '../mapbox/poi_subclass';
import { sources } from '../../config/constants.yml';
import nconf from '@qwant/nconf-getter';

const categoryConfig = nconf.get().category;
const MAX_PLACES = Number(categoryConfig.maxPlaces);

const reviewsPartial = ({ reviews, poi }) =>
  renderStaticReact(<ReviewScore reviews={reviews} poi={poi} />);
const openingHourPartial = poi => renderStaticReact(<OpeningHour poi={poi} />);

export default class CategoryPanel {
  constructor() {
    this.panel = new Panel(this, CategoryPanelView);
    this.panelResizer = new PanelResizer(this.panel);
    this.reviewsPartial = reviewsPartial;
    this.openingHourPartial = openingHourPartial;
    this.pois = [];
    this.categoryName = '';
    this.active = false;
    this.poiSubClass = poiSubClass;
    this.PoiMarkers = [];
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
    const bbox = window.map.bbox();
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

    this.panel.update();
    const container = document.querySelector('.category__panel__scroll');
    if (container) {
      container.scrollTop = 0;
    }

    this.addCategoryMarkers();
    fire('save_location');
    window.execOnMapLoaded(() => {
      this.panelResizer.updateMapUiPosition();
    });
  }

  async open(options = {}) {
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
      await this.panel.update();
    }
  }

  close(keepCategoryMarkers = false) {
    document.querySelector('.top_bar').classList.remove('top_bar--category-open');
    this.active = false;
    this.panel.update();
    if (!keepCategoryMarkers) {
      this.removeCategoryMarkers();
    }
  }

  showPhoneNumber(options) {
    const poi = options.poi;
    const i = options.i;
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
    window.app.navigateTo('/');
  }

  addCategoryMarkers() {
    fire('add_category_markers', this.pois);
  }

  removeCategoryMarkers() {
    fire('remove_category_markers', this.pois);
  }

  selectPoi(poi) {
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
    this.highlightPoiMarker(poi);
  }

  highlightPoiMarker(poi) {
    const marker = document.getElementById(poi.marker_id);
    if (marker) {
      marker.classList.add('active');
    }
  }

  unhighlightPoiMarker(poi) {
    const marker = document.getElementById(poi.marker_id);
    if (marker) {
      marker.classList.remove('active');
    }
  }

  isSourcePagesjaunes() {
    return this.dataSource === sources.pagesjaunes;
  }
}
