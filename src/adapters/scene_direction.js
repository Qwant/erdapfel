import { Marker, LngLatBounds } from 'mapbox-gl--ENV';
import bbox from '@turf/bbox';
import { normalizeToFeatureCollection } from 'src/libs/geojson';
import { map } from '../../config/constants.yml';
import LatLonPoi from '../adapters/poi/latlon_poi';
import { prepareRouteColor, getRouteStyle, setActiveRouteStyle } from './route_styles';
import { getAllSteps, getAllStops, originDestinationCoords } from 'src/libs/route_utils';
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
    this.mapFeaturesByRoute = {};

    const iconsBaseUrl = nconf.get().system.baseUrl + 'statics/images/direction_icons';
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_active.png`, 'walking_bullet_active',
      { pixelRatio: 4 });
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_inactive.png`, 'walking_bullet_inactive',
      { pixelRatio: 4 });

    listen('set_routes', ({ routes, vehicle }) => {
      this.reset();
      this.routes = routes;
      this.vehicle = vehicle;
      this.displayRoute();
    });

    listen('set_main_route', ({ routeId, fitView }) => {
      this.setMainRoute(routeId, fitView);
    });

    listen('clean_routes', () => {
      this.reset();
    });

    listen('zoom_step', step => {
      fire('fit_map', this.computeBBox(step));
    });

    listen('highlight_step', step => {
      this.highlightStep(step);
    });

    listen('unhighlight_step', step => {
      this.unhighlightStep(step);
    });

    listen('set_origin', poi => {
      this.setOrigin(poi);
      fire('fit_map', poi, false);
    });

    listen('set_destination', poi => {
      this.setDestination(poi);
      fire('fit_map', poi, false);
    });
  }

  setOrigin = poi => {
    const originMarker = createMarker(
      poi.latLon,
      'itinerary_marker_origin', { draggable: true }
    )
      .addTo(this.map)
      .on('dragend', event => this.refreshDirection('origin', event.target.getLngLat()));
    this.routeMarkers.push(originMarker);
  }

  setDestination = poi => {
    const destinationMarker = createMarker(
      poi.latLon,
      'itinerary_marker_destination', { draggable: true, anchor: 'bottom' }
    )
      .addTo(this.map)
      .on('dragend', event => this.refreshDirection('destination', event.target.getLngLat()));
    this.routeMarkers.push(destinationMarker);
  }

  addMarkerSteps(route) {
    if (this.vehicle !== 'walking' && this.vehicle !== 'publicTransport') {
      getAllSteps(route).forEach((step, idx) => {
        const stepMarker = createMarker(step.maneuver.location, 'itinerary_marker_step');
        stepMarker.getElement().id = 'itinerary_marker_step_' + idx;
        this.routeMarkers.push(stepMarker.addTo(this.map));
      });
    }

    if (this.vehicle === 'publicTransport') {
      getAllStops(route).forEach((stop, idx) => {
        const stopMarker = createMarker(stop.location, 'itinerary_marker_step');
        stopMarker.getElement().id = 'itinerary_marker_stop_' + idx;
        stopMarker.getElement().title = stop.name;
        this.routeMarkers.push(stopMarker.addTo(this.map));
      });
    }
  }

  setMainRoute(routeId, fitView) {
    let mainRoute = null;
    this.routes.forEach(route => {
      const isActive = route.id === routeId;
      if (isActive) {
        mainRoute = route;
      }
      this.mapFeaturesByRoute[route.id].forEach(({ layerId, outlineLayerId, vehicle }) => {
        setActiveRouteStyle(this.map, layerId, vehicle, isActive, false);
        if (outlineLayerId) {
          setActiveRouteStyle(this.map, outlineLayerId, vehicle, isActive, true);
        }
        if (isActive) {
          if (outlineLayerId) {
            this.map.moveLayer(outlineLayerId, map.routes_layer);
          }
          this.map.moveLayer(layerId, map.routes_layer);
        }
      });
    });
    this.updateMarkers(mainRoute);
    if (fitView) {
      fire('fit_map', this.computeBBox(mainRoute));
    }
  }

  updateMarkers(mainRoute) {
    if (!mainRoute) {
      return;
    }

    this.routeMarkers.forEach(marker => { marker.remove(); });
    this.routeMarkers = [];

    this.addMarkerSteps(mainRoute);
    const { origin, destination } = originDestinationCoords(mainRoute);

    this.setOrigin({ latLon: { lng: origin[0], lat: origin[1] } });

    this.setDestination({ latLon: { lng: destination[0], lat: destination[1] } });
  }

  displayRoute() {
    if (this.routes && this.routes.length > 0) {
      this.mapFeaturesByRoute = {};
      this.routes.forEach(route => {
        this.mapFeaturesByRoute[route.id] = this.addRouteFeatures(route);
      });
      const mainRoute = this.routes.find(route => route.isActive);
      this.setMainRoute(mainRoute.id, true);
    }
  }

  refreshDirection(type, lngLat) {
    const newPoint = new LatLonPoi(lngLat);
    fire('change_direction_point', type, newPoint);
  }

  reset() {
    this.routes.forEach(route => {
      this.mapFeaturesByRoute[route.id].forEach(({ outlineLayerId, layerId, sourceId }) => {
        if (outlineLayerId) {
          this.map.removeLayer(outlineLayerId);
        }
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
    const walkFeatures = [], nonWalkFeatures = [];
    featureCollection.features.forEach(feature => {
      if (this.vehicle === 'walking'
      || (this.vehicle === 'publicTransport' && feature.properties.mode === 'WALK')) {
        walkFeatures.push(feature);
      } else {
        nonWalkFeatures.push(prepareRouteColor(feature));
      }
    });

    if (walkFeatures.length > 0) {
      sources.push({
        vehicle: 'walking',
        data: { type: 'FeatureCollection', features: walkFeatures },
      });
    }

    if (nonWalkFeatures.length > 0) {
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
      const sourceId = `source_${route.id}_${idx}`;
      this.map.addSource(sourceId, { type: 'geojson', data: source.data });

      const layerId = `route_${route.id}_${idx}`;
      const layerStyle = {
        ...getRouteStyle(source.vehicle, route.isActive, false),
        id: layerId,
        source: sourceId,
      };

      let outlineLayerId;
      if (source.vehicle !== 'walking') {
        outlineLayerId = layerId + '_outline';
        const outlineLayerStyle = {
          ...getRouteStyle(source.vehicle, route.isActive, true),
          id: layerId + '_outline',
          source: sourceId,
        };
        this.map.addLayer(outlineLayerStyle, map.routes_layer);
      }

      this.map.addLayer(layerStyle, map.routes_layer)
        .on('click', layerId, () => { fire('select_road_map', route.id); })
        .on('mouseenter', layerId, () => { this.map.getCanvas().style.cursor = 'pointer'; })
        .on('mouseleave', layerId, () => { this.map.getCanvas().style.cursor = ''; });

      return { sourceId, layerId, outlineLayerId, vehicle: source.vehicle };
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

  addMapImage(url, name, options = {}) {
    this.map.loadImage(url, (error, image) => {
      if (error) {
        Error.sendOnce('scene', 'initMapBox', `Failed to load image at ${url}`, error);
        return;
      }
      this.map.addImage(name, image, options);
    });
  }
}
