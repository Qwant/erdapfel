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

PoiPanel.prototype.isOpen = function(oh) {
  let d = new Date()
  let dn = d.getDay()
  let rato = oh[days[dn]]
  const days = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su']
    [hours, minutes] = rato.split(':')
  return  rato < d.getHours() && rato > d.getHours()
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
