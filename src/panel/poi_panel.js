import PoiPanelView from '../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import PoiBlocContainer from './poi_bloc/poi_bloc_container'
import PanelManager from './../proxies/panel_manager'

const store = new Store()

function PoiPanel() {
  this.isPoiComplient = true
  this.poi = null
  this.active = false
  this.poiBlocContainer = new PoiBlocContainer()
  this.panel = new Panel(this, PoiPanelView)
  PanelManager.register(this)
}

PoiPanel.prototype.toggleStorePoi = function() {
  if(this.poi.stored) {
    fire('del_poi', this.poi)
    this.panel.removeClassName(.2, '.poi_panel__store_status__toggle', 'poi_panel__store_status__toggle--stored')
    this.panel.removeClassName(.2, '.poi_panel__store_status__toggle', 'icon-icon_star-filled')
    this.panel.addClassName(.2, '.poi_panel__store_status__toggle', 'icon-icon_star')
    this.poi.stored = false
  } else {
    this.panel.removeClassName(.2, '.poi_panel__store_status__toggle', 'icon-icon_star')
    this.panel.addClassName(.2, '.poi_panel__store_status__toggle', 'icon-icon_star-filled')
    this.panel.addClassName(.2, '.poi_panel__store_status__toggle', 'poi_panel__store_status__toggle--stored')
    fire('store_poi', this.poi)
    this.poi.stored = true
  }
}

PoiPanel.prototype.toggle = async function() {
  if(this.active) {
    this.close()
  } else {
    PanelManager.closeAll()
    this.open()
  }
}

PoiPanel.prototype.open = async function() {
  fire('poi_open')
  await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = true
  this.panel.update()
}

PoiPanel.prototype.close = async function() {
  await this.panel.addClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = false
  this.panel.update()
}

PoiPanel.prototype.setPoi = async function (poi) {
  fire('poi_open')
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

  if(this.active === false) {
    await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  }
  this.active = true
  await this.panel.update()
}

export default PoiPanel
