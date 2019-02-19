import {Map, Marker, LngLat, LngLatBounds} from 'mapbox-gl--ENV'
import Device from '../libs/device'
import layouts from "../panel/layouts.js";

const ALTERNATE_ROUTE_COLOR = '#c8cbd3'
const MAIN_ROUTE_COLOR = '#4ba2ea'

export default class SceneDirection {
  constructor(map) {
    this.map = map
    this.routeCounter = 0
    this.routes = []
    this.markerOrigin = null
    this.markerDestination = null
    this.markersSteps = []

    listen('set_route', ({routes, vehicle, origin, destination, move}) => {
      this.reset()
      this.routes = routes
      this.vehicle = vehicle
      this.origin = origin
      this.destination = destination
      this.displayRoute(move)
    })

    listen('show_marker_steps', () => {
      this.showMarkerSteps();
    })

    listen('toggle_route', (mainRouteId) => {
      this.setMainRoute(mainRouteId)
    })

    listen('clean_route', () => {
      this.reset()
    })

    listen('zoom_step', (step) => {
      fire('fit_map', this.computeBBox(step), layouts.ITINERARY)
    })

    listen('highlight_step', (step) => {
      this.highlightStep(step);
    })

    listen('unhighlight_step', (step) => {
      this.unhighlightStep(step);
    })
  }

  showMarkerSteps() {
    if(this.vehicle !== "walking" && window.innerWidth > 640) {
      this.steps.forEach((step) => {
        const markerStep = document.createElement('div')
        markerStep.className = 'itinerary_marker_step'
        this.markersSteps.push(
          new Marker(markerStep)
            .setLngLat(this.steps[step].maneuver.location)
            .addTo(this.map)
        )
      })
    }
  }

  setMainRoute(routeId) {
    this.routes.forEach((route) => {
      this.map.setFeatureState({source: `source_${route.id}`, id: 1}, {isActive: route.id === routeId})
    })
    this.map.moveLayer(`route_${routeId}`)
  }

  displayRoute(move) {
    if(this.routes && this.routes.length > 0) {
      this.routes.forEach((route) => {
        this.showPolygon(route)
      })
      let mainRoute = this.routes.find((route) => route.isActive)
      this.map.moveLayer(`route_${mainRoute.id}`)
      this.steps = mainRoute.legs[0].steps

      // Clean previous markers (if any)
      this.markersSteps.forEach((step) => {
        step.remove()
      })
      this.markersSteps = []

      if(this.markerOrigin){
        this.markerOrigin.remove()
      }

      if(this.markerDestination){
        this.markerDestination.remove()
      }

      // Custom markers
      if (this.vehicle !== "walking" && !Device.isMobile()) {
        this.showMarkerSteps()
      }

      const markerOrigin = document.createElement('div')
      markerOrigin.className = this.vehicle === "walking" ? 'itinerary_marker_origin_walking' : 'itinerary_marker_origin'
      this.markerOrigin = new Marker(markerOrigin)
        .setLngLat(this.steps[0].maneuver.location)
        .addTo(this.map)

      const markerDestination = document.createElement('div')
      markerDestination.className = 'itinerary_marker_destination'
      this.markerDestination = new Marker(markerDestination)
        .setLngLat(this.steps[this.steps.length - 1].maneuver.location)
        .addTo(this.map)

      let bbox = this.computeBBox(mainRoute);
      if(move !== false){
        fire('fit_map', bbox, layouts.ITINERARY)
      }
    }
  }

  reset() {
    this.routes.forEach((route) => {
      this.map.removeLayer(`route_${route.id}`)
      this.map.getSource(`source_${route.id}`).setData(this.buildRouteData([]))
    })

    this.markersSteps.forEach((step) => {
      step.remove()
    })
    this.markersSteps = []

    if(this.markerOrigin) {
      this.markerOrigin.remove()
    }
    if(this.markerDestination) {
      this.markerDestination.remove()
    }
    this.markerOrigin = null
    this.markerDestination = null
    this.routes = []
  }

  showPolygon(route) {
    const geojson = {
      "id": `route_${route.id}`,
      "type": "line",
      "source": `source_${route.id}`,
      "layout": {
        "line-join": "round",
        "line-cap": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": ["case",
          ["boolean", ["feature-state", "isActive"], route.isActive],
          MAIN_ROUTE_COLOR,
          ALTERNATE_ROUTE_COLOR
        ],
        "line-width": 7
      }
    }

    let sourceId = `source_${route.id}`
    let existingSource = this.map.getSource(sourceId)
    if(existingSource) {
      existingSource.setData(this.buildRouteData(route.geometry.coordinates))
      this.map.setFeatureState({source: sourceId, id: 1}, {isActive: route.isActive})
    } else {
      const sourceJSON = {
        "type": "geojson",
        "data": this.buildRouteData(route.geometry.coordinates)
      }
      this.map.addSource(sourceId, sourceJSON)
    }
    this.map.addLayer(geojson);

  }

  buildRouteData(data) {
    return {
      "id" : 1,
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": data
      }
    }
  }

  computeBBox(polygon) {
    let bounds = new LngLatBounds()
    polygon.geometry.coordinates.forEach((coordinate) => {
      bounds.extend(new LngLat(coordinate[0], coordinate[1]))
    })

    return bounds
  }

  highlightStep(step){
    if(this.markersSteps[step]){
      this.markersSteps[step]._element.classList.add("itinerary_marker_step--highlighted")
    }
  }

  unhighlightStep(step){
    if(this.markersSteps[step]){
      this.markersSteps[step]._element.classList.remove("itinerary_marker_step--highlighted")
    }
  }
}
