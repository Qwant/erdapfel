import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import OsmSchedule from '../../../src/adapters/osm_schedule'

function HourPanel(block, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = block.name
  this.title = options.title
  this.opening = new OsmSchedule(block, options.messages)
  this.latLng = poi.latLon
  this.isCollapsed = true
}

HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
  if(this.isCollapsed) {
    this.panel.addClassName(.3, '.poi_panel__info__hours__status__toggle', 'poi_panel__info__hours__status__toggle--reversed')
    this.isCollapsed = false
  } else {
    this.panel.removeClassName(.3, '.poi_panel__info__hours__status__toggle', 'poi_panel__info__hours__status__toggle--reversed')
    this.isCollapsed = true
  }
}

export default HourPanel
