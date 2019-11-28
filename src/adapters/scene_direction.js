import { Marker, LngLatBounds } from 'mapbox-gl--ENV';
import bbox from '@turf/bbox';
import { normalizeToFeatureCollection } from 'src/libs/geojson';
import { map } from '../../config/constants.yml';
import Device from '../libs/device';
import layouts from '../panel/layouts.js';
import LatLonPoi from '../adapters/poi/latlon_poi';
import { getOutlineFeature, getRouteStyle, setActiveRouteStyle } from './route_styles';
import { getAllSteps } from 'src/libs/route_utils';
import Error from '../adapters/error';
import nconf from '@qwant/nconf-getter';

export default class SceneDirection {
  constructor(map) {
    this.map = map;
    this.routes = [];
    this.markerOrigin = null;
    this.markerDestination = null;
    this.markersSteps = [];
    this.directionPanel = window.app.directionPanel;
    this.mapFeaturesByRoute = {};

    const iconsBaseUrl = nconf.get().system.baseUrl + 'statics/images/direction_icons';
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_active.png`, 'walking_bullet_active');
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_inactive.png`, 'walking_bullet_inactive');

    listen('set_route', ({ routes, vehicle, origin, destination, move }) => {
      this.reset();
      this.routes = routes;
      this.vehicle = vehicle;
      this.origin = origin;
      this.destination = destination;
      this.displayRoute(move);
    });

    listen('show_marker_steps', () => {
      this.showMarkerSteps();
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

  showMarkerSteps() {
    if (this.vehicle !== 'walking' && this.vehicle !== 'publicTransport' && !Device.isMobile()) {
      this.steps.forEach(step => {
        const markerStep = document.createElement('div');
        markerStep.className = 'itinerary_marker_step';
        this.markersSteps.push(
          new Marker(markerStep)
            .setLngLat(step.maneuver.location)
            .addTo(this.map)
        );
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
    this.steps = getAllSteps(mainRoute);
    // Clean previous markers (if any)
    this.markersSteps.forEach(step => {
      step.remove();
    });
    this.markersSteps = [];

    this.showMarkerSteps();
  }

  displayRoute(move) {
    if (this.routes && this.routes.length > 0) {
      this.mapFeaturesByRoute = {};
      this.routes.forEach(route => {
        this.mapFeaturesByRoute[route.id] = this.addRouteFeatures(route);
      });
      const mainRoute = this.routes.find(route => route.isActive);
      this.setMainRoute(mainRoute.id);

      const markerOrigin = document.createElement('div');
      markerOrigin.className = 'itinerary_marker_origin';
      this.markerOrigin = new Marker({
        element: markerOrigin,
        draggable: true,
      })
        .setLngLat(this.steps[0].maneuver.location)
        .addTo(this.map)
        .on('dragend', event => this.refreshDirection('origin', event.target.getLngLat()));

      const lastStepCoords = this.steps[this.steps.length - 1].geometry.coordinates;
      const markerDestination = document.createElement('div');
      markerDestination.className = 'itinerary_marker_destination';
      this.markerDestination = new Marker({
        element: markerDestination,
        draggable: true,
        anchor: 'bottom',
      })
        .setLngLat(lastStepCoords[lastStepCoords.length - 1])
        .addTo(this.map)
        .on('dragend', event => this.refreshDirection('destination', event.target.getLngLat()));

      const bbox = this.computeBBox(mainRoute);
      if (move !== false) {
        fire('fit_map', bbox, layouts.ITINERARY);
      }
    }
  }

  refreshDirection(type, lngLat) {
    const newPoint = new LatLonPoi(lngLat);
    if (type === 'origin') {
      this.directionPanel.selectOrigin(newPoint);
      this.directionPanel.setInputValue(type, newPoint.getInputValue());
    } else if (type === 'destination') {
      this.directionPanel.selectDestination(newPoint);
      this.directionPanel.setInputValue(type, newPoint.getInputValue());
    }
  }

  reset() {
    this.routes.forEach(route => {
      this.mapFeaturesByRoute[route.id].forEach(({ sourceId, layerId }) => {
        this.map.removeLayer(layerId);
        this.map.removeSource(sourceId);
      });
    });

    this.markersSteps.forEach(step => {
      step.remove();
    });
    this.markersSteps = [];

    if (this.markerOrigin) {
      this.markerOrigin.remove();
    }
    if (this.markerDestination) {
      this.markerDestination.remove();
    }
    this.markerOrigin = null;
    this.markerDestination = null;
    this.routes = [];
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
    if (this.markersSteps[step]) {
      this.markersSteps[step]._element.classList.add('itinerary_marker_step--highlighted');
    }
  }

  unhighlightStep(step) {
    if (this.markersSteps[step]) {
      this.markersSteps[step]._element.classList.remove('itinerary_marker_step--highlighted');
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
