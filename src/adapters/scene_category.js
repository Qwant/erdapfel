import constants from '../../config/constants.yml';
import Telemetry from 'src/libs/telemetry';
import { toUrl } from 'src/libs/pois';
import { fire, listen } from 'src/libs/customEvents';
import { poisToGeoJSON } from 'src/libs/geojson';
import { filteredPoisStyle } from 'src/adapters/pois_styles';

const DYNAMIC_POIS_LAYER = 'poi-filtered';

export default class SceneCategory {
  constructor(map) {
    this.map = map;

    this.map.addSource(DYNAMIC_POIS_LAYER, {
      type: 'geojson',
      data: null,
      promoteId: 'id', // tells MapBox-GL to use this property as internal feature identifier
    });
    this.map.addLayer({
      ...filteredPoisStyle,
      source: DYNAMIC_POIS_LAYER,
      id: DYNAMIC_POIS_LAYER,
    });
    this.map.on('click', DYNAMIC_POIS_LAYER, e => {
      e.cancelMapClick = true; // Hack as MapBox events don't have stopPropagation
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
    this.map.on('mouseleave', DYNAMIC_POIS_LAYER, e => {
      this.map.getCanvas().style.cursor = '';
      const poi = this.getPointedPoi(e);
      this.highlightPoiMarker(poi, false);
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
    listen('click_category_poi', state => {
      this.selectPoi(state);
    });
  }

  getPointedPoi = mapMouseEvent => {
    const feature = this.map.queryRenderedFeatures(mapMouseEvent.point)[0];
    return feature && this.pois.find(p => p.id === feature.id);
  }

  selectPoi = ({ poi, poiFilters, pois }) => {
    if (poi.meta && poi.meta.source) {
      Telemetry.add('open', 'poi', poi.meta.source,
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
    this.highlightPoiMarker(poi, true);
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
    this.setOsmPoisVisibility(true);
  }

  setOsmPoisVisibility(displayed) {
    constants.map.pois_layers.map(poi => {
      this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none');
    });
  }

  highlightPoiMarker = (/*poi, highlight*/) => {
    // @TODO Find a way to make the icon bigger…
    // but layout properties can't be changed with feature-state :((((
  }
}
