import { Marker } from 'mapbox-gl--ENV';
import { createEventIcon } from '../adapters/icon_manager';
import Telemetry from 'src/libs/telemetry';
import events from 'config/events.yml';
import { toUrl } from 'src/libs/pois';
import { fire, listen } from 'src/libs/customEvents';

export default class SceneEvent {
  constructor(map) {
    this.map = map;
    this.markers = [];

    listen('add_event_markers', (pois, eventName) => {
      this.removeEventMarkers();
      this.addEventMarkers(pois, eventName);
    });
    listen('remove_event_markers', () => {
      this.removeEventMarkers();
    });
    listen('highlight_event_marker', (poi, highlight) => {
      this.highlightPoiMarker(poi, highlight);
    });
    listen('click_event_poi', (poi, eventName) => {
      this.selectPoi(poi, eventName);
    });
  }

  selectPoi = (poi, eventName) => {
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
          event: eventName,
        })
      );
    }
    window.app.navigateTo(`/place/${toUrl(poi)}`, {
      poi,
      isFromEvent: true,
      sourceEvent: eventName,
      centerMap: true,
    });
    this.highlightPoiMarker(poi, true);
  }

  addEventMarkers(pois, eventName) {
    const eventIcon = events.find(ev => ev.name === eventName.toLowerCase()).icon;
    if (pois) {
      pois.forEach(poi => {
        const { id, name, latLon } = poi;
        const marker = createEventIcon({ eventIcon }, name, true);
        poi.marker_id = `marker_${id}`;
        marker.onclick = function(e) {
          e.stopPropagation();
          fire('click_event_poi', poi, eventName);
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

  removeEventMarkers() {
    this.markers.map(mark => mark.remove());
    this.markers = [];
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
