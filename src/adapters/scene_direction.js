import React from 'react';
import RouteLabel from 'src/panel/direction/RouteLabel';
import { Marker, LngLatBounds } from 'mapbox-gl';
import bbox from '@turf/bbox';
import { normalizeToFeatureCollection } from 'src/libs/geojson';
import { map } from '../../config/constants.yml';
import LatLonPoi from '../adapters/poi/latlon_poi';
import { prepareRouteColor, getRouteStyle, setActiveRouteStyle } from './route_styles';
import { getAllSteps, getAllStops, originDestinationCoords } from 'src/libs/route_utils';
import Error from '../adapters/error';
import nconf from '@qwant/nconf-getter';
import { fire, listen } from 'src/libs/customEvents';
import { getLabelPositions } from 'alt-route-labeller';
import { isMobileDevice } from 'src/libs/device';
import renderStaticReact from 'src/libs/renderStaticReact';

const createMarker = (lngLat, className = '', options = {}) => {
  const element = document.createElement('div');
  element.className = className;
  return new Marker({ ...options, element }).setLngLat(lngLat);
};

const createRouteLabel = (route, vehicle, { lngLat, anchor }) => {
  const element = document.createElement('div');
  element.innerHTML = renderStaticReact(
    <RouteLabel route={route} vehicle={vehicle} anchor={anchor} />
  );
  element.className = 'routeLabel-marker';
  element.onclick = () => {
    fire('select_road_map', route.id);
  };
  return new Marker({ element, anchor }).setLngLat(lngLat);
};

const getLabelsBbbox = (labelPositions, routesBbox) => {
  const smallScreen = isMobileDevice();
  const shift = {
    latShift: (routesBbox.getNorth() - routesBbox.getSouth()) / (smallScreen ? 5 : 10),
    lngShift: (routesBbox.getEast() - routesBbox.getWest()) / (smallScreen ? 3 : 10),
  };
  const labelsBbbox = new LngLatBounds();
  labelPositions.map(shiftLabelPosition(shift)).forEach(labelPosition => {
    labelsBbbox.extend(labelPosition);
  });
  return labelsBbbox;
};

const shiftLabelPosition =
  ({ lngShift, latShift }) =>
  ({ lngLat, anchor }) => {
    let [lng, lat] = lngLat;
    if (anchor === 'top') {
      lat -= latShift;
    } else if (anchor === 'bottom') {
      lat += latShift;
    } else if (anchor === 'left') {
      lng += lngShift;
    } else if (anchor === 'right') {
      lng -= lngShift;
    }
    return [lng, lat];
  };

export default class SceneDirection {
  constructor(map) {
    this.map = map;
    this.routes = [];
    this.routeMarkers = [];
    this.routeLabels = [];
    this.fullBbox = null;
    this.mapFeaturesByRoute = {};

    const iconsBaseUrl = nconf.get().system.baseUrl + 'statics/images/direction_icons';
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_active.png`, 'walking_bullet_active', {
      pixelRatio: 4,
    });
    this.addMapImage(`${iconsBaseUrl}/walking_bullet_inactive.png`, 'walking_bullet_inactive', {
      pixelRatio: 4,
    });

    listen('set_routes', ({ routes, vehicle, activeRouteId = 0 }) => {
      this.reset();
      this.routes = routes;
      this.vehicle = vehicle;
      this.displayRoutes(activeRouteId);
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
    });

    listen('set_destination', poi => {
      this.setDestination(poi);
    });
  }

  setOrigin = poi => {
    const originMarker = createMarker(poi.latLon, 'itinerary_marker_origin', {
      draggable: !isMobileDevice(),
    })
      .addTo(this.map)
      .on('dragend', event => {
        this.refreshDirection('origin', event.target.getLngLat());
      });
    this.routeMarkers.push(originMarker);
  };

  setDestination = poi => {
    const destinationMarker = createMarker(poi.latLon, 'itinerary_marker_destination', {
      draggable: !isMobileDevice(),
      anchor: 'bottom',
    })
      .addTo(this.map)
      .on('dragend', event => {
        this.refreshDirection('destination', event.target.getLngLat());
      });
    this.routeMarkers.push(destinationMarker);
  };

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
    if (this.routes.length === 0) {
      return;
    }

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
    this.updateRouteLabels(mainRoute);
    if (fitView && this.fullBbox) {
      fire('fit_map', this.fullBbox);
    }
  }

  updateMarkers(mainRoute) {
    if (!mainRoute) {
      return;
    }

    this.routeMarkers.forEach(marker => {
      marker.remove();
    });
    this.routeMarkers = [];

    this.addMarkerSteps(mainRoute);
    const { origin, destination } = originDestinationCoords(mainRoute);

    this.setOrigin({ latLon: { lng: origin[0], lat: origin[1] } });

    this.setDestination({ latLon: { lng: destination[0], lat: destination[1] } });
  }

  displayRoutes(activeRouteId) {
    if (this.routes && this.routes.length > 0) {
      // route lines
      this.mapFeaturesByRoute = {};
      this.routes.forEach(route => {
        this.mapFeaturesByRoute[route.id] = this.addRouteFeatures(
          route,
          route.id === activeRouteId
        );
      });
      // route labels
      const labelPositions = getLabelPositions(this.routes.map(route => route.geometry));
      this.routeLabels = labelPositions.map(({ lngLat, anchor }, index) =>
        createRouteLabel(this.routes[index], this.vehicle, { lngLat, anchor }).addTo(this.map)
      );
      // compute and store the best bbox
      const routesBbox = new LngLatBounds();
      this.routes.forEach(route => {
        routesBbox.extend(this.computeBBox(route));
      });
      this.fullBbox = routesBbox.extend(getLabelsBbbox(labelPositions, routesBbox));

      this.setMainRoute(activeRouteId, true);
    }
  }

  updateRouteLabels({ id: activeRouteId }) {
    // @IE11: array spread to convert NodeList to an array
    [...document.querySelectorAll('.routeLabel')].forEach(routeLabel => {
      if (routeLabel.dataset.id === activeRouteId.toString()) {
        routeLabel.classList.add('active');
      } else {
        routeLabel.classList.remove('active');
      }
    });
  }

  refreshDirection(type, lngLat) {
    const newPoint = new LatLonPoi(lngLat);
    fire('change_direction_point', type, '', newPoint);
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

    this.routeMarkers.concat(this.routeLabels).forEach(marker => {
      marker.remove();
    });
    this.routeMarkers = [];
    this.routeLabels = [];
    this.fullBbox = null;
  }

  getDataSources(route) {
    const featureCollection = normalizeToFeatureCollection(route.geometry);
    const sources = [];
    const walkFeatures = [],
      nonWalkFeatures = [];
    featureCollection.features.forEach(feature => {
      if (
        this.vehicle === 'walking' ||
        (this.vehicle === 'publicTransport' && feature.properties.mode === 'WALK')
      ) {
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

  addRouteFeatures(route, isActive) {
    const sources = this.getDataSources(route);
    return sources.map((source, idx) => {
      const sourceId = `source_${route.id}_${idx}`;
      this.map.addSource(sourceId, { type: 'geojson', data: source.data });

      const layerId = `route_${route.id}_${idx}`;
      const layerStyle = {
        ...getRouteStyle(source.vehicle, isActive, false),
        id: layerId,
        source: sourceId,
      };

      let outlineLayerId;
      if (source.vehicle !== 'walking') {
        outlineLayerId = layerId + '_outline';
        const outlineLayerStyle = {
          ...getRouteStyle(source.vehicle, isActive, true),
          id: layerId + '_outline',
          source: sourceId,
        };
        this.map.addLayer(outlineLayerStyle, map.routes_layer);
      }

      this.map
        .addLayer(layerStyle, map.routes_layer)
        .on('click', layerId, () => {
          fire('select_road_map', route.id);
        })
        .on('mouseenter', layerId, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        })
        .on('mouseleave', layerId, () => {
          this.map.getCanvas().style.cursor = '';
        });

      return { sourceId, layerId, outlineLayerId, vehicle: source.vehicle };
    });
  }

  computeBBox({ geometry }) {
    const [minX, minY, maxX, maxY] = bbox(geometry);
    return new LngLatBounds([minX, minY], [maxX, maxY]);
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
