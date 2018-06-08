import PoiPanelView from '../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import PoiBlocContainer from './poi_bloc/poi_bloc_container'
import PanelManager from './../proxies/panel_manager'
import UrlState from "../proxies/url_state";
import ExtendedString from "../libs/string";

const store = new Store()

function PoiPanel() {
  this.isPoiComplient = true /* Poi Compliant */
  this.poi = null
  this.active = false
  this.poiBlocContainer = new PoiBlocContainer()
  this.panel = new Panel(this, PoiPanelView)
  PanelManager.register(this)
  UrlState.registerResource(this, 'place')
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
  UrlState.pushUrl()
}

PoiPanel.prototype.close = async function() {
  await this.panel.addClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = false
  this.panel.update()
  UrlState.pushUrl()
}

PoiPanel.prototype.restorePoi = async function (poi) {
  this.poi = poi
  this.poi.stored = await isPoiFavorite(poi)
  this.active = true
  await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  await this.panel.update()
}

PoiPanel.prototype.setPoi = async function (poi) {
  fire('poi_open')
  this.poi = poi
  this.poi.stored = isPoiFavorite(poi)
  if(this.active === false) {
    await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  }
  this.active = true
  UrlState.pushUrl()
  await this.panel.update()
}

/* urlState interface implementation */

PoiPanel.prototype.store = function() {
  // TODO temporary way to store poi, will be replaced by poi id + slug & poi API
  if(this.poi && this.poi.name && this.active) {
    return ExtendedString.slug(this.poi.name)
  }
  return ''
}

PoiPanel.prototype.restore = function(urlShard) {
  if(urlShard) {
    this.restorePoi({
      name : urlShard
    })
  }
}

/* private */

async function isPoiFavorite(poi) {
  try {
    let storePoi = await store.has(poi)
    if(storePoi) {
      return true
    }
  } catch(e) {
    return false
  }
  return false
}

export default PoiPanel
