import { Marker, LngLatBounds } from 'mapbox-gl--ENV';
import bbox from '@turf/bbox';
import { normalizeToFeatureCollection } from 'src/libs/geojson';
import { map } from '../../config/constants.yml';
import Device from '../libs/device';
import layouts from '../panel/layouts.js';
import LatLonPoi from '../adapters/poi/latlon_poi';
import { getOutlineFeature, getRouteStyle, setActiveRouteStyle } from './route_styles';
import { getAllSteps, originDestinationCoords } from 'src/libs/route_utils';
import Error from '../adapters/error';
import nconf from '@qwant/nconf-getter';

const createMarker = (lngLat, className = '', options = {}) => {
  const element = document.createElement('div');
  element.className = className;
  return new Marker({ ...options, element }).setLngLat(lngLat);
};

export default class SceneDirection {
  constructor(map) {
    this.map = map;
    this.routes = [];
    this.routeMarkers = [];
    this.directionPanel = window.app.directionPanel;
    this.mapFeaturesByRoute = {};

    const iconsBaseUrl = nconf.get().system.baseUrl + 'statics/images/direction_icons';
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_active.png`, 'walking_bullet_active');
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_inactive.png`, 'walking_bullet_inactive');

    listen('set_route', ({ routes, vehicle, move }) => {
      this.reset();
      this.routes = routes;
      this.vehicle = vehicle;
      this.displayRoute(move);
    });

    listen('toggle_route', mainRouteId => {
      this.setMainRoute(mainRouteId);
    });

    listen('clean_route', () => {
      this.reset();
    });

    listen('zoom_step', step => {
      fire('fit_map', this.computeBBox(step), layouts.ITINERARY);
    });

    listen('highlight_step', step => {
      this.highlightStep(step);
    });

    listen('unhighlight_step', step => {
      this.unhighlightStep(step);
    });
  }

  addMarkerSteps(route) {
    if (this.vehicle !== 'walking' && this.vehicle !== 'publicTransport' && !Device.isMobile()) {
      getAllSteps(route).forEach((step, idx) => {
        const stepMarker = createMarker(step.maneuver.location, 'itinerary_marker_step');
        stepMarker.getElement().id = 'itinerary_marker_step_' + idx;
        this.routeMarkers.push(stepMarker.addTo(this.map));
      });
    }
  }

  setMainRoute(routeId) {
    let mainRoute = null;
    this.routes.forEach(route => {
      const isActive = route.id === routeId;
      if (isActive) {
        mainRoute = route;
      }
      this.mapFeaturesByRoute[route.id].forEach(({ layerId, vehicle, isOutline }) => {
        setActiveRouteStyle(this.map, layerId, vehicle, isActive, isOutline);
        if (isActive) {
          this.map.moveLayer(layerId, map.routes_layer);
        }
      });
    });
    this.updateMarkers(mainRoute);
  }

  updateMarkers(mainRoute) {
    if (!mainRoute) {
      return;
    }

    this.routeMarkers.forEach(marker => { marker.remove(); });
    this.routeMarkers = [];

    this.addMarkerSteps(mainRoute);

    const { origin, destination } = originDestinationCoords(mainRoute);

    const originMarker = createMarker(origin, 'itinerary_marker_origin', { draggable: true })
      .addTo(this.map)
      .on('dragend', event => this.refreshDirection('origin', event.target.getLngLat()));

    const destinationMarker = createMarker(destination,
      'itinerary_marker_destination', {
        draggable: true,
        anchor: 'bottom',
      })
      .addTo(this.map)
      .on('dragend', event => this.refreshDirection('destination', event.target.getLngLat()));

    this.routeMarkers.push(originMarker);
    this.routeMarkers.push(destinationMarker);
  }

  displayRoute(move) {
    if (this.routes && this.routes.length > 0) {
      this.mapFeaturesByRoute = {};
      this.routes.forEach(route => {
        this.mapFeaturesByRoute[route.id] = this.addRouteFeatures(route);
      });
      const mainRoute = this.routes.find(route => route.isActive);
      this.setMainRoute(mainRoute.id);

      const bbox = this.computeBBox(mainRoute);
      if (move !== false) {
        fire('fit_map', bbox, layouts.ITINERARY);
      }
    }
  }

  refreshDirection(type, lngLat) {
    this.directionPanel.selectPoint(type, new LatLonPoi(lngLat));
  }

  reset() {
    this.routes.forEach(route => {
      this.mapFeaturesByRoute[route.id].forEach(({ sourceId, layerId }) => {
        this.map.removeLayer(layerId);
        this.map.removeSource(sourceId);
      });
    });
    this.routes = [];

    this.routeMarkers.forEach(step => { step.remove(); });
    this.routeMarkers = [];
  }

  getDataSources(route) {
    const featureCollection = normalizeToFeatureCollection(route.geometry);
    const sources = [];
    let walkFeatures = [], nonWalkFeatures = [];
    if (this.vehicle === 'publicTransport') {
      featureCollection.features.forEach(feature => {
        if (feature.properties.mode === 'WALK') {
          walkFeatures.push(feature);
        } else {
          nonWalkFeatures.push(feature);
        }
      });
    } else if (this.vehicle === 'walking') {
      walkFeatures = featureCollection.features;
    } else {
      nonWalkFeatures = featureCollection.features;
    }

    if (walkFeatures.length > 0) {
      sources.push({
        vehicle: 'walking',
        data: { type: 'FeatureCollection', features: walkFeatures },
      });
    }

    if (nonWalkFeatures.length > 0) {
      // we have to duplicate the layers to get the outline effect
      sources.push({
        vehicle: this.vehicle,
        isOutline: true,
        data: { type: 'FeatureCollection', features: nonWalkFeatures.map(getOutlineFeature) },
      });
      sources.push({
        vehicle: this.vehicle,
        data: { type: 'FeatureCollection', features: nonWalkFeatures },
      });
    }

    return sources;
  }

  addRouteFeatures(route) {
    const sources = this.getDataSources(route);
    return sources.map((source, idx) => {
      const layerId = `route_${route.id}_${idx}`;
      const sourceId = `source_${route.id}_${idx}`;
      const layerStyle = {
        ...getRouteStyle(source.vehicle, route.isActive, source.isOutline),
        id: layerId,
        source: sourceId,
      };

      this.map
        .addSource(sourceId, { type: 'geojson', data: source.data })
        .addLayer(layerStyle, map.routes_layer)
        .on('click', layerId, () => { fire('select_road_map', route.id); })
        .on('mouseenter', layerId, () => { this.map.getCanvas().style.cursor = 'pointer'; })
        .on('mouseleave', layerId, () => { this.map.getCanvas().style.cursor = ''; });

      return { sourceId, layerId, vehicle: source.vehicle, isOutline: source.isOutline };
    });
  }

  computeBBox({ geometry }) {
    const [ minX, minY, maxX, maxY ] = bbox(geometry);
    return new LngLatBounds([ minX, minY ], [ maxX, maxY ]);
  }

  highlightStep(step) {
    const marker = document.querySelector('#itinerary_marker_step_' + step);
    if (marker) {
      marker.classList.add('itinerary_marker_step--highlighted');
    }
  }

  unhighlightStep(step) {
    const marker = document.querySelector('#itinerary_marker_step_' + step);
    if (marker) {
      marker.classList.remove('itinerary_marker_step--highlighted');
    }
  }

  addMapImage(url, name) {
    this.map.loadImage(url, (error, image) => {
      if (error) {
        Error.sendOnce('scene', 'initMapBox', `Failed to load image at ${url}`, error);
        return;
      }
      this.map.addImage(name, image);
    });
  }
}
