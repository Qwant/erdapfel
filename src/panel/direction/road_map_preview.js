import Panel from "../../libs/panel";
import roadMapTemplate from '../../views/direction/road_map_preview.dot'

export default class RoadMapPreviewPanel {
  constructor(hideForm, distance) {
    this.panel = new Panel(this, roadMapTemplate)
    this.routeId = 0
    this.stepId = 0
    this.hideForm = hideForm
    this.routes = []
    this.distance = distance
  }

  setRoad(routes) {
    this.routes = routes
    this.routeId = 0
    this.stepId = 0
    this.step = this.routes[0].legs[this.routeId].steps[this.stepId]
    fire('zoom_step', this.step)
    this.hideForm()
  }

  exitPreview() {
    document.querySelectorAll(".itinerary_fields")[0].style.display = "block"
    document.querySelectorAll(".itinerary_vehicles")[0].style.display = "block"
  }

  next() {
    this.stepId += 1
    this.step = this.routes[0].legs[this.routeId].steps[this.stepId]
    fire('zoom_step', this.step)
    this.panel.update()
  }

  previous() {
    this.stepId -= 1
    this.step = this.routes[0].legs[this.routeId].steps[this.stepId]
    fire('zoom_step', this.step)
    this.panel.update()
  }
}