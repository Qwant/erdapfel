import Panel from "../../libs/panel"
import directionTemplate from '../../views/direction/direction.dot'
import DirectionInput from "../../ui_components/direction_input"
import RoadMapPanel from './road_map_panel'
import DirectionApi from '../../adapters/direction_api'
import SearchInput from '../../ui_components/search_input'
import UrlPoi from "../../adapters/poi/url_poi";
import PanelManager from "../../proxies/panel_manager";
import ExtendedString from "../../libs/string"

export default class DirectionPanel {
  constructor() {
    this.panel = new Panel(this, directionTemplate)
    this.active = false
    this.isDirectionPanel = true
    this.DRIVING = 'driving'
    this.WALKING = 'walking'
    this.CYCLING = 'cycling'

    this.start = null
    this.end = null
    this.vehicle = this.DRIVING
    this.roadMapPanel = new RoadMapPanel()
    PanelManager.register(this)
    this.restoreUrl()

    console.log(this.start)
    console.log(this.end)
  }

  initDirection() {
    let startHandler = '#itinerary_input_start'
    let destinationHandler = '#itinerary_input_end'

    this.startInput = new DirectionInput(startHandler, (poi) => this.selectStart(poi), 'submit_direction_start')
    this.endInput = new DirectionInput(destinationHandler, (poi) => this.selectEnd(poi), 'submit_direction_end')
  }

  setVehicle(vehicle) {
    this.panel.removeClassName(0, `.itinerary_button_label_${this.vehicle}`, 'label_active')
    this.vehicle = vehicle
    this.panel.addClassName(0, `.itinerary_button_label_${vehicle}`, 'label_active')
  }

  invertStartEnd() {
    let startValue = this.startInput.getValue()
    let endValue = this.endInput.getValue()
    this.startInput.setValue(endValue)
    this.endInput.setValue(startValue)
    let tmp = this.start
    this.start = this.end
    this.end = tmp
    this.startSearch()
  }

  selectStart(poi) {
    this.start = poi
    this.startSearch()
  }

  selectEnd(poi) {
    this.end = poi
    this.startSearch()
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
    if(this.startInput && this.endInput) {
      this.startInput.destroy()
      this.endInput.destroy()
    }
  }

  close() {
    SearchInput.unMinify()
    this.active = false
    this.panel.update()
    this.cleanDirection()
  }

  async open() {
    SearchInput.minify()
    this.active = true
    await this.panel.update()
    this.initDirection()
  }

  async startSearch() {

    if (this.start && this.end) {
      let directionResponse = await DirectionApi.search(this.start, this.end, this.vehicle)
      let routes = directionResponse.routes
      routes.forEach((route, i) => {
        route.isActive = i === 0
        route.id = i
      })
      if(routes) {
        this.roadMapPanel.setRoad(routes, this.vehicle)
        fire('set_route', {routes : routes, vehicle : this.vehicle, start : this.start, end : this.end})
      }
    }
  }

  /* urlState interface implementation */

  restoreUrl() {
    let rawGetParams = window.location.search
    let originData = rawGetParams.match(this.buildExtractUrlRegex('origin'))
    let destinationData = rawGetParams.match(this.buildExtractUrlRegex('destination'))

    if(originData) {
      this.start = this.parseRoute(originData)
    }
    if(destinationData) {
      this.end = this.parseRoute(destinationData)
    }
    this.active = this.start || this.end
  }

  // private
  parseRoute(pointData) {
    if(pointData[1] && pointData[2]) {
      let lat = pointData[1]
      let lng = pointData[2]
      let latLng = {lat : parseFloat(lat), lng : parseFloat(lng)}
      if(pointData[4]) {
        return new UrlPoi(latLng, ExtendedString.htmlEncode(pointData[4]))
      } else {
        return new UrlPoi(latLng)
      }
    }
    return null
  }

  buildExtractUrlRegex(source) {
    return new RegExp(`${source}=(-?\\d*\\.\\d*):(-?\\d*\\.\\d*)(@(.*))?`)
  }
}
