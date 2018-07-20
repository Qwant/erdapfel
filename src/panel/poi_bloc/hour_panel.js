import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import {parse, openingStatus, nextTransitionTime} from '../../../src/adapters/opening_hour'

function HourPanel(block, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = block.name
  this.timeMessages = options.messages
  this.title = options.title
  this.hours = parse(block.raw)
  this.nextTransition = nextTransitionTime(block.seconds_before_next_transition, block.next_transition_datetime)
  this.displayHours = translateHours(this.hours)
  this.latLng = poi.latLon
  this.status = openingStatus(this.hours, this.timeMessages)
}

HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
}

/* privates */

function translateHours(hours) {
  if(hours) {
    return Object.keys(hours).map((hourKey) => {
      return {dayName : getDay(hourKey), opening : hours[hourKey]}
    })
  } else {
    return []
  }
}

export default HourPanel
