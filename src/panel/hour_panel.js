import HourPanelView from 'dot-loader!../views/hour_panel.dot'
import Panel from "../libs/panel";

/**
 *
 * @param name
 * @param time
 * @param timeMessages [time : xx, message : 'opening soon' .. // -1 for open message
 * @constructor
 */
function HourPanel(name, hours, timeMessages) {
  this.panel = new Panel(this, HourPanelView)
  this.name = name
  this.timeMessages = timeMessages
  this.hours = hours
}

HourPanel.prototype.computeRemainingTime = function() {
  if(!this.hours) return -1
  let d = new Date()
  let dn = d.getDay()

  const days = ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa']
  let schedules = this.hours[days[dn]]
  if(!schedules) return -1
  let open = schedules[0]
  let close = schedules[1]

  let currentTime = d.getHours() * 60 + d.getMinutes() //convert time to minutes

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

HourPanel.prototype.status = function() {
  let remaining = this.computeRemainingTime()
  if(remaining === -1) {
    return `<span style="color:#${closed.msg}">${closed.msg}</span>`
  }
  for(let tmKey in this.timeMessages) {
    let tm = this.timeMessages[tmKey]
    if(tm.time && tm.time > remaining) {
      return `<span style="color:#${this.timeMessages.open.c}">${tm.msg}</span>`
    }
  }

  return `<span style="color:#${this.timeMessages.open.c}">${this.timeMessages.open.msg}</span>`
}


HourPanel.prototype.extend = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
}

export default HourPanel
