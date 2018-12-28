import Direction from '../max/qwantDirection'
import Panel from "../libs/panel"
import directionTemplate from '../views/direction.dot'

export default class DirectionPanel {
  constructor() {
    this.panel = new Panel(this, directionTemplate)
    execOnMapLoaded(() => {
      this.initDirection()
    })
  }
  initDirection() {
    this.panelHandler = document.querySelector('#itinerary_container')
    /* add direction layer */
    Direction.ui(this.panelHandler, 'to remove fr');
  }
}
