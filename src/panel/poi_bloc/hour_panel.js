import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import Ajax from "../../libs/ajax";
import openingHourParse from '../../../src/adapters/opening_hour'
import I18n from '../../libs/i18n'

const services = require('../../../config/services.yml')

function HourPanel(tag, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = tag.name
  this.timeMessages = options.messages
  this.title = options.title
  this.hours = openingHourParse(tag.value)
  this.displayHours = translateHours(this.hours)
  this.latLng = poi.latLon
  this.status = {msg : '', color : '#fff'}
  this.computeStatus()
}

HourPanel.prototype.computeRemainingTime = async function() {
  let rawDate
  if(this.hours && this.hours['24/7']) {
    return 999 /* be sure it won't close soon */
  }
  rawDate = new Date()

  let remoteDate = new Date(rawDate)

  if(!this.hours) return -1
  let dn = remoteDate.getDay()

  let schedules = this.hours[I18n.days[dn]]
  if(!schedules) return -1
  let open = schedules[0]
  let close = schedules[1]

  let currentTime = remoteDate.getHours() * 60 + remoteDate.getMinutes() //convert time to minutes

  let [hours, minutes] = open.split(':') // time format is hh:mm
  let openingTime = parseInt(hours) * 60 + parseInt(minutes);

  [hours, minutes] = close.split(':')
  let closingTime = parseInt(hours) * 60 + parseInt(minutes)
  if(openingTime < closingTime) { // 10h00 14h30
    if(currentTime > openingTime && currentTime < closingTime) {
      return closingTime - currentTime
    }
  } else { // 17h00 2h00
    if(currentTime < openingTime || currentTime > closingTime) {
      return currentTime - closingTime
    }
  }
  return -1 // closed
}

HourPanel.prototype.computeStatus = function() {
  if(!this.hours) {
    return
  }
  this.computeRemainingTime().then((remaining) => {
    if(remaining === -1) {
      this.status = {msg : this.timeMessages.closed.msg, color : this.timeMessages.closed.color}
      this.panel.update()
      return
    }
    for(let tmKey in this.timeMessages) {
      let tm = this.timeMessages[tmKey]
      if(tm.time && tm.time > remaining) {
        this.status = {msg : tm.msg, color : this.timeMessages.open.color}
        this.panel.update()
        return
      }
    }
    this.status = {msg : this.timeMessages.open.msg, color : this.timeMessages.open.color}
    this.panel.update()
  })
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
