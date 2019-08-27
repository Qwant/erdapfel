import { Marker, LngLatBounds } from 'mapbox-gl--ENV';
import bbox from '@turf/bbox';
import { map } from '../../config/constants.yml';
import Device from '../libs/device';
import layouts from '../panel/layouts.js';
import LatLonPoi from '../adapters/poi/latlon_poi';

const ALTERNATE_ROUTE_COLOR = '#c8cbd3';
const MAIN_ROUTE_COLOR = '#4ba2ea';


export default class SceneDirection {
  constructor(map) {
    this.map = map;
    this.routeCounter = 0;
    this.routes = [];
    this.markerOrigin = null;
    this.markerDestination = null;
    this.markersSteps = [];
    this.directionPanel = window.app.directionPanel;

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
    if (this.vehicle !== 'walking' && window.innerWidth > 640) {
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
      this.map.setFeatureState({ source: `source_${route.id}`, id: 1 }, { isActive });

      if (this.vehicle === 'walking') {
        this.map.setLayoutProperty(`route_${route.id}`, 'icon-image',
          isActive ? 'walking_bullet_active' : 'walking_bullet_inactive');
      }
    });
    this.updateMarkers(mainRoute);
    this.map.moveLayer(`route_${routeId}`, map.routes_layer);
  }

  updateMarkers(mainRoute) {
    if (!mainRoute) {
      return;
    }
    this.steps = mainRoute.legs[0].steps;
    // Clean previous markers (if any)
    this.markersSteps.forEach(step => {
      step.remove();
    });
    this.markersSteps = [];

    // Custom markers
    if (!Device.isMobile()) {
      this.showMarkerSteps();
    }
  }

  displayRoute(move) {
    if (this.routes && this.routes.length > 0) {
      this.routes.forEach(route => {
        this.addRouteFeature(route, this.vehicle);
      });
      const mainRoute = this.routes.find(route => route.isActive);
      this.map.moveLayer(`route_${mainRoute.id}`, map.routes_layer);

      this.updateMarkers(mainRoute);

      const markerOrigin = document.createElement('div');
      markerOrigin.className = this.vehicle === 'walking' ?
        'itinerary_marker_origin_walking' : 'itinerary_marker_origin';
      this.markerOrigin = new Marker({
        element: markerOrigin,
        draggable: true,
      })
        .setLngLat(this.steps[0].maneuver.location)
        .addTo(this.map)
        .on('dragend', event => this.refreshDirection('origin', event.target.getLngLat()));

      const markerDestination = document.createElement('div');
      markerDestination.className = 'itinerary_marker_destination';
      this.markerDestination = new Marker({
        element: markerDestination,
        draggable: true,
      })
        .setLngLat(this.steps[this.steps.length - 1].maneuver.location)
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
      this.map.removeLayer(`route_${route.id}`);
      this.map.removeSource(`source_${route.id}`);
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

  addRouteFeature(route, vehicle) {
    const layerStyle = vehicle === 'walking' ? {
      'id': `route_${route.id}`,
      'type': 'symbol',
      'source': `source_${route.id}`,
      'layout': {
        'icon-image': route.isActive ? 'walking_bullet_active' : 'walking_bullet_inactive',
        'symbol-placement': 'line',
        'symbol-spacing': 12,
        'icon-ignore-placement': true,
        'icon-allow-overlap': true,
        'symbol-avoid-edges': true,
      },
    } : {
      'id': `route_${route.id}`,
      'type': 'line',
      'source': `source_${route.id}`,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round',
        'visibility': 'visible',
      },
      'paint': {
        'line-color': ['case',
          ['boolean', ['feature-state', 'isActive'], route.isActive],
          MAIN_ROUTE_COLOR,
          ALTERNATE_ROUTE_COLOR,
        ],
        'line-width': 7,
      },
    };

    const sourceId = `source_${route.id}`;
    const sourceJSON = {
      type: 'geojson',
      data: this.getRouteGeoJson(route),
    };
    this.map.addSource(sourceId, sourceJSON);
    this.map.addLayer(layerStyle, map.routes_layer);

    this.map.on('click', `route_${route.id}`, () => {
      fire('select_road_map', route.id);
    });

    this.map.on('mouseenter', `route_${route.id}`, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', `route_${route.id}`, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  getRouteGeoJson({ geometry }) {
    if (geometry.type === 'FeatureCollection' || geometry.type === 'Feature') {
      return geometry;
    }
    return {
      id: 1,
      type: 'Feature',
      properties: {},
      geometry,
    };
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
}
