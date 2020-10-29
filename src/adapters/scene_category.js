import nconf from '@qwant/nconf-getter';
import { Marker } from 'mapbox-gl--ENV';
import constants from '../../config/constants.yml';
import Telemetry from 'src/libs/telemetry';
import { toUrl } from 'src/libs/pois';
import { fire, listen } from 'src/libs/customEvents';
import { poiToGeoJSON, emptyFeatureCollection } from 'src/libs/geojson';
import { getFilteredPoisStyle } from 'src/adapters/pois_styles';
import { isMobileDevice } from 'src/libs/device';
import { createMapGLIcon, createPinIcon } from 'src/adapters/icon_manager';
import IconManager from 'src/adapters/icon_manager';

const DYNAMIC_POIS_LAYER = 'poi-filtered';
const mapStyleConfig = nconf.get().mapStyle;

const poisToGeoJSON = pois => {
  return {
    type: 'FeatureCollection',
    features: pois.map(poi => {
      const poiFeature = poiToGeoJSON(poi);
      poiFeature.properties.iconName = IconManager.get(poi).iconClass;
      return poiFeature;
    }),
  };
};

export default class SceneCategory {
  constructor(map) {
    this.map = map;

    this.initActiveStateMarkers();
    this.initDynamicPoiLayer();

    listen('add_category_markers', this.addCategoryMarkers);
    listen('remove_category_markers', this.removeCategoryMarkers);
    listen('highlight_category_marker', this.highlightPoiMarker);
    listen('click_category_marker', this.selectPoiMarker);
    listen('click_category_poi', this.selectPoi);
    listen('clean_marker', () => this.selectPoiMarker(null));
  }

  initActiveStateMarkers = () => {
    this.hoveredPoi = null;
    this.hoveredMarker = new Marker({
      element: createPinIcon({ disablePointerEvents: true, className: 'marker--category' }),
      anchor: 'bottom',
    });
    this.selectedPoi = null;
    this.selectedMarker = new Marker({
      element: createPinIcon({ className: 'marker--category' }),
      anchor: 'bottom',
    });
  }

  initDynamicPoiLayer = () => {
    // Declare a new image in MapBox-GL rasters so it can be used in the layer style
    createMapGLIcon('./statics/images/map/pin_map_dot.svg', 50, 60)
      .then(imageData => {
        this.map.addImage('pin_with_dot', imageData);
      });

    this.map.addSource(DYNAMIC_POIS_LAYER, {
      type: 'geojson',
      data: emptyFeatureCollection,
      // tells MapBox-GL to use this property as internal feature identifier
      promoteId: 'id',
    });
    this.map.addLayer({
      ...getFilteredPoisStyle({ withName: mapStyleConfig.showNamesWithPins }),
      source: DYNAMIC_POIS_LAYER,
      id: DYNAMIC_POIS_LAYER,
    });
    this.map.on('click', DYNAMIC_POIS_LAYER, this.handleLayerMarkerClick);
    if (!isMobileDevice()) {
      this.map.on('mousemove', DYNAMIC_POIS_LAYER, this.handleLayerMarkerMouseMove);
      this.map.on('mouseleave', DYNAMIC_POIS_LAYER, this.handleLayerMarkerMouseLeave);
    }
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

  handleLayerMarkerClick = e => {
    e.originalEvent.stopPropagation();
    const poi = this.getPointedPoi(e);
    this.selectPoi({
      poi,
      pois: this.pois,
      poiFilters: this.poiFilters,
    });
  }

  handleLayerMarkerMouseMove = e => {
    this.map.getCanvas().style.cursor = 'pointer';
    const poi = this.getPointedPoi(e);
    if (this.selectedPoi?.id !== poi.id) {
      this.highlightPoiMarker(poi, true);
      fire('open_popup', this.getPointedPoi(e), e.originalEvent);
    }
  }

  handleLayerMarkerMouseLeave = () => {
    this.map.getCanvas().style.cursor = '';
    this.highlightPoiMarker(this.hoveredPoi, false);
    fire('close_popup');
  }

  addCategoryMarkers = (pois = [], poiFilters) => {
    this.pois = pois;
    this.poiFilters = poiFilters;
    this.setOsmPoisVisibility(false);
    this.map.getSource(DYNAMIC_POIS_LAYER).setData(poisToGeoJSON(pois));
    this.map.setLayoutProperty(DYNAMIC_POIS_LAYER, 'visibility', 'visible');
  }

  removeCategoryMarkers = () => {
    this.selectPoiMarker(null);
    this.highlightPoiMarker(this.hoveredPoi, false);
    this.map.setLayoutProperty(DYNAMIC_POIS_LAYER, 'visibility', 'none');
    this.setOsmPoisVisibility(true);
  }

  setOsmPoisVisibility = displayed => {
    constants.map.pois_layers.map(poi => {
      this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none');
    });
  }

  setPoiFeatureState = (id, state) => {
    this.map.setFeatureState({ id, source: DYNAMIC_POIS_LAYER }, state);
  }

  highlightPoiMarker = (poi, highlight) => {
    if (this.hoveredPoi) {
      this.setPoiFeatureState(this.hoveredPoi.id, { hovered: false });
    }
    if (highlight) {
      this.hoveredPoi = poi;
      this.hoveredMarker
        .setLngLat(poi.latLon)
        .addTo(this.map);
      this.setPoiFeatureState(this.hoveredPoi.id, { hovered: true });
    } else {
      this.hoveredMarker.remove();
      this.hoveredPoi = null;
    }
  }

  selectPoiMarker = poi => {
    if (this.selectedPoi === poi) {
      return;
    }
    if (this.selectedPoi) {
      this.setPoiFeatureState(this.selectedPoi.id, { selected: false });
    }
    if (poi) {
      this.selectedPoi = poi;
      this.selectedMarker
        .setLngLat(poi.latLon)
        .addTo(this.map);
      this.setPoiFeatureState(this.selectedPoi.id, { selected: true });
    } else {
      this.selectedMarker.remove();
      this.selectedPoi = null;
    }
  }
}
