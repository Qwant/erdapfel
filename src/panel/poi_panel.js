import PoiPanelView from 'dot-loader!../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"

const store = new Store()

function PoiPanel() {
  listen('mark_poi', (poi) => {
    this.showInfoBox(poi)
  })
  this.poi = null
  this.active = false
  this.panel = new Panel(this, PoiPanelView)
}

PoiPanel.prototype.storePoi = function() {
  fire('store_poi', this.poi)
  this.poi.stored = true
  this.panel.update()
}

PoiPanel.prototype.close = function() {
  this.panel.animate(.25,'.poi_panel', {left:'-300px'})
}

PoiPanel.prototype.isOpen = function(oh) {
  if(!oh) return -1
  let d = new Date()
  let dn = d.getDay()

  const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
  let schedules = oh[days[dn]]
  if(!schedules) return -1
  let open = schedules[0]
  let close = schedules[1]

  let currentTime = d.getHours() * 60 + d.getMinutes()

  let [hours, minutes] = open.split(':')
  let openingTime = parseInt(hours) * 60 + parseInt(minutes);

  [hours, minutes] = close.split(':')
  let closingTime = parseInt(hours) * 60 + parseInt(minutes)
  if(openingTime < closingTime) { // 10h 14h30
    if(currentTime > openingTime && currentTime < closingTime) {
      return closingTime - currentTime
    }
  } else { // 2h 1h
    if(currentTime < openingTime || currentTime > closingTime) {
      return currentTime - closingTime
    }
  }
  return -1
}

PoiPanel.prototype.openHours = function() {
  this.panel.toggleClassName(.3, '.poi_panel__info__hours', 'poi_panel__info__hours--open')
}

PoiPanel.prototype.showInfoBox = function(poi) {
  new Promise((resolve) => {
    store.has(poi).then((storePoi) => {
      this.poi = poi
      if(storePoi) {
        this.poi.stored = true
      }
      resolve()
    }).catch(() => {
      this.poi = poi
      this.poi.stored = false
      resolve()
    })
  }).then(() => {
    this.panel.update().then(() => {
      this.active = true
      this.panel.animate(.25,'.poi_panel', {left:0})
    })
  })
}

export default PoiPanel
