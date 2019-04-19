import {Marker, LngLat, LngLatBounds} from 'mapbox-gl--ENV'
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
    this.directionPanel = PanelManager.getDirectionPanel()

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
            .setLngLat(step.maneuver.location)
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
        this.showPolygon(route, this.vehicle)
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
      if (!Device.isMobile()) {
        this.showMarkerSteps()
      }

      const markerOrigin = document.createElement('div')
      markerOrigin.className = this.vehicle === "walking" ? 'itinerary_marker_origin_walking' : 'itinerary_marker_origin'
      this.markerOrigin = new Marker({
        element: markerOrigin,
        draggable: true
      })
        .setLngLat(this.steps[0].maneuver.location)
        .addTo(this.map)

      this.markerOrigin.on('dragend', (event) => this.refreshDirection(event, 'origin'))

      const markerDestination = document.createElement('div')
      markerDestination.className = 'itinerary_marker_destination'
      this.markerDestination = new Marker({
        element: markerDestination,
        draggable: true
      })
        .setLngLat(this.steps[this.steps.length - 1].maneuver.location)
        .addTo(this.map)

      this.markerDestination.on('dragend', (event) => this.refreshDirection(event, 'destination'))

      let bbox = this.computeBBox(mainRoute);
      if(move !== false){
        fire('fit_map', bbox, layouts.ITINERARY)
      }
    }
  }

  refreshDirection(event, type) {
    const originlngLat = this.markerOrigin.getLngLat();
    const destinationlngLat = this.markerDestination.getLngLat();
    this.directionPanel.setInputValue(type, type === 'origin' ?
      `${parseFloat(originlngLat.lat).toFixed(5)} : ${parseFloat(originlngLat.lng).toFixed(5)}` :
      `${parseFloat(destinationlngLat.lat).toFixed(5)} : ${parseFloat(destinationlngLat.lng).toFixed(5)}`)
    this.directionPanel.searchDirectionByCoordinates(originlngLat, destinationlngLat)
  }

  reset() {
    this.routes.forEach((route) => {
      this.map.removeLayer(`route_${route.id}`)
      this.map.removeSource(`source_${route.id}`)
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

  showPolygon(route, vehicle) {
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
    const sourceJSON = {
      "type": "geojson",
      "data": this.buildRouteData(route.geometry.coordinates)
    }
    this.map.addSource(sourceId, sourceJSON)
    this.map.addLayer(geojson)

    this.map.on('click', `route_${route.id}`, function(){
      fire('select_road_map', route.id)
    });

    this.map.on('mouseenter', `route_${route.id}`, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    })

    this.map.on('mouseleave', `route_${route.id}`, () =>{
      this.map.getCanvas().style.cursor = '';
    })

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
