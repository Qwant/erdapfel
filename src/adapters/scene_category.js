import { Marker } from 'mapbox-gl--ENV';
import constants from '../../config/constants.yml';
import Telemetry from 'src/libs/telemetry';
import { toUrl } from 'src/libs/pois';
import { fire, listen } from 'src/libs/customEvents';
import { poisToGeoJSON, emptyFeatureCollection } from 'src/libs/geojson';
import { filteredPoisStyle } from 'src/adapters/pois_styles';
import { createMapGLIcon, createIcon } from 'src/adapters/icon_manager';

const DYNAMIC_POIS_LAYER = 'poi-filtered';

export default class SceneCategory {
  constructor(map) {
    this.map = map;
    this.hoveredMarker = new Marker({
      element: createIcon({ disablePointerEvents: true }),
      anchor: 'bottom',
    });
    this.selectedMarker = new Marker({
      element: createIcon({}),
      anchor: 'bottom',
    });

    createMapGLIcon('./statics/images/map/pin_map_dot.svg', 50, 60)
      .then(imageData => {
        this.map.addImage('pin_with_dot', imageData);
      });

    this.map.addSource(DYNAMIC_POIS_LAYER, {
      type: 'geojson',
      data: emptyFeatureCollection,
      promoteId: 'id', // tells MapBox-GL to use this property as internal feature identifier
    });
    this.map.addLayer({
      ...filteredPoisStyle,
      source: DYNAMIC_POIS_LAYER,
      id: DYNAMIC_POIS_LAYER,
    });
    this.map.on('click', DYNAMIC_POIS_LAYER, e => {
      e.originalEvent.stopPropagation();
      const poi = this.getPointedPoi(e);
      this.selectPoi({
        poi,
        pois: this.pois,
        poiFilters: this.poiFilters,
      });
    });
    this.map.on('mouseenter', DYNAMIC_POIS_LAYER, e => {
      this.map.getCanvas().style.cursor = 'pointer';
      const poi = this.getPointedPoi(e);
      this.highlightPoiMarker(poi, true);
      fire('open_popup', this.getPointedPoi(e), e.originalEvent);
    });
    this.map.on('mouseleave', DYNAMIC_POIS_LAYER, () => {
      this.map.getCanvas().style.cursor = '';
      this.highlightPoiMarker(null, false);
      fire('close_popup');
    });

    listen('add_category_markers', (pois, poiFilters) => {
      this.addCategoryMarkers(pois, poiFilters);
    });
    listen('remove_category_markers', () => {
      this.removeCategoryMarkers();
    });
    listen('highlight_category_marker', (poi, highlight) => {
      this.highlightPoiMarker(poi, highlight);
    });
    listen('click_category_marker', poi => {
      this.selectPoiMarker(poi);
    });
    listen('click_category_poi', state => {
      this.selectPoi(state);
    });
    listen('clean_marker', () => {
      this.selectPoiMarker(null);
    });
  }

  getPointedPoi = mapMouseEvent => {
    const feature = mapMouseEvent.features[0];
    return feature && this.pois.find(p => p.id === feature.id);
  }

  selectPoi = ({ poi, poiFilters, pois }) => {
    if (poi.meta && poi.meta.source) {
      Telemetry.sendPoiEvent(poi, 'open',
        Telemetry.buildInteractionData({
          id: poi.id,
          source: poi.meta.source,
          template: 'multiple',
          zone: 'list',
          element: 'item',
          category: poiFilters.category,
        })
      );
    }
    window.app.navigateTo(`/place/${toUrl(poi)}`, {
      poi,
      poiFilters,
      pois,
      centerMap: true,
    });
    this.selectPoiMarker(poi);
  }

  addCategoryMarkers(pois = [], poiFilters) {
    this.pois = pois;
    this.poiFilters = poiFilters;
    this.setOsmPoisVisibility(false);
    this.map.getSource(DYNAMIC_POIS_LAYER).setData(poisToGeoJSON(pois));
    this.map.setLayoutProperty(DYNAMIC_POIS_LAYER, 'visibility', 'visible');
  }

  removeCategoryMarkers() {
    this.map.setLayoutProperty(DYNAMIC_POIS_LAYER, 'visibility', 'none');
    this.hoveredMarker.remove();
    this.selectedMarker.remove();
    this.setOsmPoisVisibility(true);
  }

  setOsmPoisVisibility(displayed) {
    constants.map.pois_layers.map(poi => {
      this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none');
    });
  }

  highlightPoiMarker = (poi, highlight) => {
    if (highlight) {
      this.hoveredMarker
        .setLngLat(poi.latLon)
        .addTo(this.map);
    } else {
      this.hoveredMarker.remove();
    }
  }

  selectPoiMarker = poi => {
    if (poi) {
      this.selectedMarker
        .setLngLat(poi.latLon)
        .addTo(this.map);
    } else {
      this.selectedMarker.remove();
    }
  }
}
