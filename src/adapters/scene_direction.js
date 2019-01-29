import {Map, Marker, LngLat, LngLatBounds} from 'mapbox-gl--ENV'
import Direction from "./poi/specials/direction_poi";
import Device from '../libs/device'
const ALTERNATE_ROUTE_COLOR = '#c8cbd3'
const MAIN_ROUTE_COLOR = '#4ba2ea'

export default class SceneDirection {
  constructor(map) {
    this.map = map
    this.routeCounter = 0
    this.routes = []
    this.markerStart = null
    this.markerEnd = null
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
      this.routes.forEach((route) => {
        this.map.setFeatureState({source: `source_${route.id}`, id: 1}, {isActive: route.id === mainRouteId})
      })
      this.map.moveLayer(`route_${mainRouteId}`)
    })

    listen('clean_route', () => {
      this.reset()
    })

    listen('zoom_step', (step) => {
      fire('fit_bbox', {bbox : this.computeBBox(step)}, {sidePanelOffset : true})
    })

    listen('highlight_step', (step) => {
      this.highlightStep(step);
    })

    listen('unhighlight_step', (step) => {
      this.unhighlightStep(step);
    })
  }

  displayRoute(move) {
    if(this.routes && this.routes.length > 0){
      let mainRoute = this.routes.find((route) => route.isActive)
      let otherRoutes = this.routes.filter((route) => !route.isActive)

      otherRoutes.forEach((route) => {
        this.showPolygon(route)
      })
      this.showPolygon(mainRoute)

    // Hide previously drawn steps markers
    if(this.markersSteps.length > 0){
      for(var markerStep in this.markersSteps){
        this.markersSteps[markerStep].remove()
      }
    }

    this.markersSteps = []

      // Custom markers
      const markerOriginDom = document.createElement('div')
      markerOriginDom.className = this.vehicle === "walking" ? 'itinerary_marker_origin_walking' : 'itinerary_marker_origin'

      this.markerOrigin = new Marker(markerOriginDom)
        .setLngLat([this.origin.latLon.lng, this.origin.latLon.lat])
        .addTo(this.map)

      const markerDestinationDom = document.createElement('div')
      markerDestinationDom.className = 'itinerary_marker_destination'


      this.markerDestination = new Marker(markerDestinationDom)
        .setLngLat([this.destination.latLon.lng, this.destination.latLon.lat])
        .addTo(this.map)

      var steps = mainRoute.legs[0].steps;
      if (this.vehicle !== "walking") {

      if (this.vehicle !== "walking" && window.innerWidth > 640) {
        for (var step in steps) {
          const markerStep = document.createElement('div')
          markerStep.className = 'itinerary_marker_step'
          this.markersSteps.push(
            new Marker(markerStep)
                .setLngLat(steps[step].maneuver.location)
                .addTo(this.map)
          )
        }
      }

  displayRoute() {
    if(this.routes && this.routes.length > 0) {
      this.mainRoute = this.routes.find((route) => route.isActive)
      let otherRoutes = this.routes.filter((route) => !route.isActive)
      this.steps = this.mainRoute.legs[0].steps;

      otherRoutes.forEach((route) => {
        this.showPolygon(route)
      })
      this.showPolygon(this.mainRoute)

      // Custom markers
      if (this.vehicle !== "walking" && window.innerWidth > 640) {
        this.showMarkerSteps()
      }

      const markerStart = document.createElement('div')
      markerStart.className = this.vehicle === "walking" ? 'itinerary_marker_start_walking' : 'itinerary_marker_start'
      this.markerStart = new Marker(markerStart)
          .setLngLat(this.steps[0].maneuver.location)
          .addTo(this.map)

      const markerEnd = document.createElement('div')
      markerEnd.className = 'itinerary_marker_end'
      this.markerEnd = new Marker(markerEnd)
          .setLngLat(this.steps[this.steps.length - 1].maneuver.location)
          .addTo(this.map)

      let bbox = this.computeBBox(this.mainRoute);
      let padding = {};
      if(Device.isMobile()){
        padding = {top: 180, right: 20, bottom: 110, left: 20 };
      }
      else {
        padding = {top: 20, right: 20, bottom: 40, left: 450 }
      }
      fire('fit_bbox', bbox, padding)

      let directionPoi = new Direction(this.computeBBox(mainRoute))
      if(move !== false) {
        fire('fit_map', directionPoi, {sidePanelOffset : true})
      }
    }
  }

  reset() {
    this.routes.forEach((route) => {
      this.map.removeLayer(`route_${route.id}`)
      this.map.getSource(`source_${route.id}`).setData(this.buildRouteData([]))
    })

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
    this.markersSteps[step]._element.classList.add("itinerary_marker_step--highlighted")
  }

  unhighlightStep(step){
    this.markersSteps[step]._element.classList.remove("itinerary_marker_step--highlighted")
  }
}
