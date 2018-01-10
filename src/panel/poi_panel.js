import PoiPanelView from 'dot-loader!../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"

const store = new Store()

function PoiPanel() {
  listen('mark_poi', (poi) => {
    this.showInfoBox(poi)
  })
  this.poi = null
  this.panel = new Panel(this, PoiPanelView)
}

PoiPanel.prototype.storePoi = function() {
  fire('store_poi', this.poi)
  this.poi.stored = true
  this.panel.update()
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
      this.panel.animate(1,'.poi_panel', {bottom:0})
    })
  })

}

export default PoiPanel
