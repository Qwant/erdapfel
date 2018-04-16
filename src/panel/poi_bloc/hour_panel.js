import HourPanelView from '../../views/poi_bloc/hour.dot'
import Panel from "../../libs/panel";
import Ajax from "../../libs/ajax";
const services = require('../../../config/services.yml')

function HourPanel(tag, poi, options) {
  this.panel = new Panel(this, HourPanelView)
  this.name = tag.name
  this.timeMessages = options.messages
  this.title = options.title
  this.hours = tag.value
  this.latLng = poi.latLon
  this.status = {msg : '', color : '#fff'}
  this.computeStatus()
}

HourPanel.prototype.computeRemainingTime = async function() {
  let rawDate
  try {
    if(services.tz.active) {
      rawDate = await Ajax.query(services.tz.url, {latitude : this.latLng.lat, longitude : this.latLng.lng}, {method : 'get'})
    } else {
      rawDate = new Date()
    }
  } catch (e) {
    fire('error_h', 'Unreachable time zone service - using local date 💳')
    rawDate = new Date()
  }

  let remoteDate = new Date(rawDate)

  if(!this.hours) return -1
  let dn = remoteDate.getDay()

  const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']
  let schedules = this.hours[days[dn]]
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

  this.computeRemainingTime().then((remaining) => {
    if(remaining === -1) {
      this.status = {msg : this.timeMessages.closed.msg, color : this.timeMessages.closed.c}
      this.panel.update()
      return
    }
    for(let tmKey in this.timeMessages) {
      let tm = this.timeMessages[tmKey]
      if(tm.time && tm.time > remaining) {
        this.status = {msg : tm.msg, color : this.timeMessages.open.c}
        this.panel.update()
        return
      }
    }
    this.status = {msg : this.timeMessages.open.msg, color : this.timeMessages.open.c}
    this.panel.update()
  })
}


HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
}

export default HourPanel
