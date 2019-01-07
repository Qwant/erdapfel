import Panel from "../../libs/panel"
import directionTemplate from '../../views/direction/direction.dot'
import DirectionInput from "../../adapters/direction_input"
import PanelManager from '../../proxies/panel_manager'
import RoadMapPanel from './road_map_panel'
import DirectionApi from '../../adapters/direction_api'

const CAR = 'car'

export default class DirectionPanel {
  constructor() {
    this.panel = new Panel(this, directionTemplate)
    execOnMapLoaded(() => {
      this.initDirection()
    })
    this.start = null
    this.end = null
    this.vehicle = CAR
    this.roadMapPanel = new RoadMapPanel()
  }

  initDirection() {
    let startHandler = '#itinerary_input_start'
    let destinationHandler = '#itinerary_input_end'

    new DirectionInput(startHandler, (poi) => this.selectStart(poi))
    new DirectionInput(destinationHandler, (poi) => this.selectEnd(poi))
  }

  selectStart(poi) {
    this.start = poi
    this.select()

  }

  selectEnd(poi) {
    this.end = poi
    this.select()
  }

  async select() {

    if (this.start && this.end) {
      let directionResponse = await DirectionApi.search(this.start, this.end, this.vehicle)
      this.roadMapPanel.update()
    }
  }
}
