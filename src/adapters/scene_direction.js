import {Map, Marker, LngLat, LngLatBounds} from 'mapbox-gl--ENV'
import Direction from "./poi/specials/direction_poi";
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

    listen('set_route', ({routes, vehicle, start, end}) => {
      this.reset()
      this.routes = routes
      this.vehicle = vehicle
      this.start = start
      this.end = end
      this.displayRoute()

    })

    listen('toggle_route', (mainRouteId) => {
      this.routes.forEach((route) => {
        this.map.setFeatureState({source: `source_${route.id}`, id: 1}, {isActive: route.id === mainRouteId})
      })
      this.map.moveLayer(`route_${mainRouteId}`)
    })

    listen('zoom_step', (step) => {
      fire('fit_bbox', {bbox : this.computeBBox(step)}, {sidePanelOffset : true})
    })
  }

  displayRoute() {
    if(this.routes && this.routes.length > 0) {
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


      var steps = mainRoute.legs[0].steps;

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

      const markerStart = document.createElement('div')
      markerStart.className = this.vehicle === "walking" ? 'itinerary_marker_start_walking' : 'itinerary_marker_start'

      this.markerStart = new Marker(markerStart)
          .setLngLat(steps[0].maneuver.location)
          .addTo(this.map)


      const markerEnd = document.createElement('div')
      markerEnd.className = 'itinerary_marker_end'

      this.markerEnd = new Marker(markerEnd)
          .setLngLat(steps[steps.length - 1].maneuver.location)
          .addTo(this.map)

      let directionPoi = new Direction(this.computeBBox(mainRoute))
      fire('fit_map', directionPoi, {sidePanelOffset : true})

    }
  }


  reset() {
    this.routes.forEach((route) => {
      this.map.removeLayer(`route_${route.id}`)
      this.map.getSource(`source_${route.id}`).setData(this.buildRouteData([]))
    })

    if(this.markerStart) {
      this.markerStart.remove()
    }
    if(this.markerEnd) {
      this.markerEnd.remove()
    }
    this.markerStart = null
    this.markerEnd = null
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
}
