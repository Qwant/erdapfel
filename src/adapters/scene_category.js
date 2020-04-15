import { Marker } from 'mapbox-gl--ENV';
import constants from '../../config/constants.yml';
import { createIcon } from '../adapters/icon_manager';
import Telemetry from 'src/libs/telemetry';
import { toUrl } from 'src/libs/pois';

export default class SceneCategory {
  constructor(map) {
    this.map = map;
    this.markers = [];

    listen('add_category_markers', (pois, poiFilters) => {
      this.resetMarkers();
      this.addCategoryMarkers(pois, poiFilters);
    });
    listen('remove_category_markers', () => {
      this.removeCategoryMarkers();
    });
    listen('highlight_category_marker', (poi, highlight) => {
      this.highlightPoiMarker(poi, highlight);
    });
    listen('click_category_poi', (poi, poiFilters) => {
      this.selectPoi(poi, poiFilters);
    });
  }

  selectPoi = (poi, poiFilters) => {
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
          category: poiFilters.category,
        })
      );
    }
    window.app.navigateTo(`/place/${toUrl(poi)}`, {
      poi,
      poiFilters,
      centerMap: true,
    });
    this.highlightPoiMarker(poi, true);
  }

  addCategoryMarkers(pois, poiFilters) {
    this.setOsmPoisVisibility(false);
    if (pois) {
      pois.forEach(poi => {
        const { id, name, className, subClassName, type, latLon } = poi;
        const marker = createIcon({ className, subClassName, type }, name, true);
        poi.marker_id = `marker_${id}`;
        marker.onclick = function(e) {
          e.stopPropagation();
          fire('click_category_poi', poi, poiFilters);
        };
        marker.onmouseover = function(e) {
          fire('open_popup', poi, e);
        };
        marker.onmouseout = function() {
          fire('close_popup');
        };
        marker.id = poi.marker_id;
        this.markers.push(
          new Marker({ element: marker })
            .setLngLat(latLon)
            .addTo(this.map)
        );
      }
      );
    }
  }

  resetMarkers() {
    this.markers.map(mark => mark.remove());
    this.markers = [];
  }

  removeCategoryMarkers() {
    this.resetMarkers();
    this.setOsmPoisVisibility(true);
  }

  setOsmPoisVisibility(displayed) {
    constants.map.pois_layers.map(poi => {
      this.map.setLayoutProperty(poi, 'visibility', displayed ? 'visible' : 'none');
    });
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
