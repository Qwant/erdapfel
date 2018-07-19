import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import {parse, openingStatus} from '../../../src/adapters/opening_hour'
const strftime = require('strftime')

function HourPanel(block, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = block.name
  this.timeMessages = options.messages
  this.title = options.title
  this.hours = parse(block.raw)
  this.nextTransition = getSecondBeforeNextTransition(block)
  this.displayHours = translateHours(this.hours)
  this.latLng = poi.latLon
  this.status = this.computeStatus()
}

HourPanel.prototype.computeStatus = function() {
  if(!this.hours) {
    return {msg : '', color : '#fff'}
  }
  let remaining = openingStatus(this.hours)
  if(remaining === -1) {
    return {msg : this.timeMessages.closed.msg, color : this.timeMessages.closed.color}
  }
  for(let tmKey in this.timeMessages) {
    let tm = this.timeMessages[tmKey]
    if(tm.time && tm.time > remaining) {
      return {msg : tm.msg, color : this.timeMessages.open.color}
    }
  }
  return {msg : this.timeMessages.open.msg, color : this.timeMessages.open.color}
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

function getSecondBeforeNextTransition(block) {
  let seconds = block.seconds_before_next_transition
  if(seconds < 12 * 60 * 60) {
    let nextTransition = new Date(block.next_transition_datetime)
    return strftime(i18nDate.timeFormat, nextTransition)
  }
  return false
}

export default HourPanel
