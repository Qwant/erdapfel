import Panel from "../../libs/panel"
import directionTemplate from '../../views/direction/direction.dot'
import DirectionInput from "../../ui_components/direction_input"
import PanelManager from '../../proxies/panel_manager'
import RoadMapPanel from './road_map_panel'
import DirectionApi from '../../adapters/direction_api'



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
  }

  initDirection() {
    let startHandler = '#itinerary_input_start'
    let destinationHandler = '#itinerary_input_end'

    this.startInput = new DirectionInput(startHandler, (poi) => this.selectStart(poi))
    this.endInput = new DirectionInput(destinationHandler, (poi) => this.selectEnd(poi))
  }

  setVehicle(vehicle) {
    this.panel.removeClassName(`.itinerary_button_label_${this.vehicle}`, '.label_active')
    this.vehicle = vehicle
    this.panel.addClassName(`.itinerary_button_label${vehicle}`, 'label_active')
  }

  invertStartEnd() {
    let tmp = this.end
    this.end = this.start
    this.start = tmp
    this.startInput.setPoi(this.start)
    this.endInput.setPoi(this.end)
  }

  selectStart(poi) {
    this.start = poi
    this.select()
  }

  selectEnd(poi) {
    this.end = poi
    this.select()
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
    this.active = false
    document.querySelector('.top_bar').classList.remove('top_bar--small')
    this.panel.update()
    this.cleanDirection()
  }

  async open() {
    this.active = true
    document.querySelector('.top_bar').classList.add('top_bar--small')
    await this.panel.update()
    this.initDirection()
  }

  async select() {

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
}
