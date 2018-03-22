import PoiPanelView from 'dot-loader!../views/poi_panel.dot'
import HourPanel from "./hour_panel";
import Panel from "../libs/panel";
import URI from "../libs/uri"
import Store from "../adapters/store"

const store = new Store()

function PoiPanel() {
  listen('mark_poi', (poi) => {
    this.showInfoBox(poi)
  })
  this.URI = URI
  this.hourPanel = HourPanel
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
  this.panel.toggleClassName(.25,'.poi_panel', 'poi_panel--closed')
}

PoiPanel.prototype.showInfoBox = async function (poi) {
  try {
    let storePoi = await store.has(poi)
    this.poi = poi
    if(storePoi) {
      this.poi.stored = true
    }
  } catch(e) {
    this.poi = poi
    this.poi.stored = false
  }

  await this.panel.update()
  this.active = true
  await this.panel.toggleClassName(.25,'.poi_panel', 'poi_panel--closed')
}

export default PoiPanel
