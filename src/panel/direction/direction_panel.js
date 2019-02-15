import Panel from "../../libs/panel"
import directionTemplate from '../../views/direction/direction.dot'
import DirectionInput from "../../ui_components/direction_input"
import RoadMapPanel from './road_map_panel'
import DirectionApi from '../../adapters/direction_api'
import SearchInput from '../../ui_components/search_input'
import UrlPoi from "../../adapters/poi/url_poi";
import PanelManager from "../../proxies/panel_manager";
import UrlState from "../../proxies/url_state";
import Error from '../../adapters/error'
import Device from '../../libs/device'
import NavigatorGeolocalisationPoi, {navigatorGeolcationStatus} from "../../adapters/poi/specials/navigator_geolocalisation_poi";

const originHandler = '#itinerary_input_origin'
const destinationHandler = '#itinerary_input_destination'

export default class DirectionPanel {
  constructor() {
    this.panel = new Panel(this, directionTemplate)
    this.isDirectionPanel = true
    this.vehicles = {DRIVING : 'driving', WALKING : 'walking', CYCLING : 'cycling'}
    this.active = false
    this.origin = null
    this.destination = null
    this.vehicle = this.vehicles.DRIVING
    this.roadMapPanel = new RoadMapPanel()
    PanelManager.register(this)
    UrlState.registerResource(this, 'routes')
  }

  initDirection() {
    let originHandler = '#itinerary_input_origin'
    let destinationHandler = '#itinerary_input_destination'
    this.originInput = new DirectionInput(originHandler, (poi) => this.selectOrigin(poi), 'submit_direction_origin')
    this.destinationInput = new DirectionInput(destinationHandler, (poi) => this.selectDestination(poi), 'submit_direction_destination')

    this.searchInputStart = document.querySelector(originHandler)
    this.searchInputEnd = document.querySelector(destinationHandler)
    this.itineraryContainer = document.querySelector('#itinerary_container')

    this.searchInputStart.onfocus = () => {
      this.itineraryContainer.classList.add('itinerary_container--start-focused')
    }

    this.searchInputStart.onblur = () => {
      this.itineraryContainer.classList.remove('itinerary_container--start-focused')
    }

    this.searchInputEnd.onfocus = () => {
      this.itineraryContainer.classList.add('itinerary_container--end-focused')
    }

    this.searchInputEnd.onblur = () => {
      this.itineraryContainer.classList.remove('itinerary_container--end-focused')
    }
  }

  setVehicle(vehicle) {
    this.panel.removeClassName(0, `.itinerary_button_label_${this.vehicle}`, 'label_active')
    this.vehicle = vehicle
    this.panel.addClassName(0, `.itinerary_button_label_${vehicle}`, 'label_active')
    UrlState.pushUrl()
    this.searchDirection()
  }

  invertOriginDestination() {
    let originValue = this.originInput.getValue()
    let destinationValue = this.destinationInput.getValue()
    this.originInput.setValue(destinationValue)
    this.destinationInput.setValue(originValue)
    let tmp = this.origin
    this.origin = this.destination
    this.destination = tmp
    this.searchDirection()
  }

  async selectOrigin(poi) {
    this.origin = poi
    this.searchDirection()
    UrlState.pushUrl()
  }

  async selectDestination(poi) {
    this.destination = poi
    this.searchDirection()
    UrlState.pushUrl()
  }


  /* panel manager implementation */
  toggle() {
    if(this.active) {
      this.close()
    } else {
      this.open()
    }
  }

  cleanDirection() {
    if(this.originInput && this.destinationInput) {
      this.originInput.destroy()
      this.destinationInput.destroy()
    }
  }

  close() {
    SearchInput.unMinify()
    fire('clean_route')
    this.active = false
    this.panel.update()
    this.cleanDirection()
    UrlState.pushUrl()
  }

  async open() {
    SearchInput.minify()
    this.active = true
    await this.panel.update()
    this.initDirection()
    UrlState.pushUrl()
  }

  async searchDirection(options) {
    if(this.origin && this.destination) {

      let directionResponse = await DirectionApi.search(this.origin, this.destination, this.vehicle)

      let routes = directionResponse.routes
      routes.forEach((route, i) => {
        route.isActive = i === 0
        route.id = i
      })
      if(routes) {
        this.roadMapPanel.setRoad(routes, this.vehicle)
        fire('set_route', {...options, routes : routes, vehicle : this.vehicle, origin : this.origin, destination : this.destination})
      }
    }
  }

  /* urlState interface implementation */

  async restore() {
    await this.restoreUrl()
    this.open()
  }

  store() {
    if(this.active) {
      let routeParams = []
      if(this.origin) {
        routeParams.push(this.poiToUrl('origin', this.origin))
      }
      if(this.destination) {
        routeParams.push(this.poiToUrl('destination', this.destination))
      }
      if(routeParams.length > 0) {
        return `?${routeParams.join('&')}&vehicle=${this.vehicle}`
      } else {
        return true
      }
    } else {
      return false
    }

  }

  async restoreUrl() {
    let getParams = new URLSearchParams(window.location.search)
    if(getParams.get('mode')) {
      let vehicleParam = getParams.get('mode')
      Object.keys(this.vehicles).forEach((vehicleKey) => {
        if(this.vehicles[vehicleKey] === vehicleParam) {
          this.vehicle = this.vehicles[vehicleKey]
        }
      })
    }

    if(getParams.get('origin')) {
      try {
        this.origin = await UrlPoi.fromUrl(getParams.get('origin'))
        document.querySelector(originHandler).value = this.origin.name
      } catch (err) {
        Error.sendOnce('direction_panel', 'restoreUrl', `Error restoring Poi from Url ${getParams.get('origin')}`, err)
      }
    }
    if(getParams.get('destination')) {
      try {
        this.destination = await UrlPoi.fromUrl(getParams.get('destination'))
        document.querySelector(destinationHandler).value = this.destination.name
      } catch (err) {
        Error.sendOnce('direction_panel', 'restoreUrl', `Error restoring Poi from Url ${getParams.get('destination')}`, err)
      }
    }

    execOnMapLoaded(() => {
      this.searchDirection({move : false})
    })
  }

  /* Private */

  poiToUrl(prefix, poi) {
    if(poi instanceof NavigatorGeolocalisationPoi || poi instanceof UrlPoi) {
      return `${prefix}=${poi.toUrl()}`
    }
    return `${prefix}=${poi.id}@${poi.name}`
  }
}
