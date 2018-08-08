import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import OsmSchedule from '../../../src/adapters/osm_schedule'

function HourPanel(block, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = block.name
  this.timeMessages =
  this.title = options.title
  this.opening = new OsmSchedule(block, options.messages)
  this.latLng = poi.latLon
}

HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
}

export default HourPanel
