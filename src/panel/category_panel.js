import React from 'react';
import ReactDOM from 'react-dom';
import SearchInput from '../ui_components/search_input';
import poiSubClass from '../mapbox/poi_subclass';
import Telemetry from '../libs/telemetry';
import ReactCategoryPanel from './category/CategoryPanel';


export default class CategoryPanel {
  constructor() {
    this.pois = [];
    this.categoryName = '';
    this.active = false;
    this.poiSubClass = poiSubClass;
    this.loading = false;
    this.query = '';
    this.dataSource = '';
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
    />;
    ReactDOM.render(panel, document.querySelector('.react_panel__container'));
  }

  close(keepCategoryMarkers = false) {
    document.querySelector('.top_bar').classList.remove('top_bar--category-open');
    this.active = false;
    ReactDOM.unmountComponentAtNode(document.querySelector('.react_panel__container'));
    if (!keepCategoryMarkers) {
      fire('remove_category_markers');
    }
  }
}
