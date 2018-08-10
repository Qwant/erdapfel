import PoiPanelView from '../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import PoiBlocContainer from './poi_bloc/poi_bloc_container'
import Poi from "../mapbox/poi"
import PanelManager from './../proxies/panel_manager'
import UrlState from '../proxies/url_state'
import ExtendedString from '../libs/string'

const poiSubClass = require('../mapbox/poi_subclass')

const store = new Store()

function PoiPanel() {
  this.isPoiComplient = true /* Poi Compliant */
  this.poi = null
  this.active = false
  this.poiSubClass = poiSubClass
  this.PoiBlocContainer = PoiBlocContainer
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
  } else if(this.poi) {
    PanelManager.closeAll()
    this.open()
  }
}

PoiPanel.prototype.isActive = async function() {
  return this.active
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

PoiPanel.prototype.restorePoi = async function (id) {
  this.poi = await Poi.poiApiLoad(id)
  fire('map_mark_poi', this.poi)
  this.poi.stored = await isPoiFavorite(this.poi)
  this.active = true
  await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  await this.panel.update()
}

PoiPanel.prototype.setPoi = async function (poi, options = {}) {
  this.poi = poi
  this.poi.stored = await isPoiFavorite(this.poi)
  this.PoiBlocContainer.set(poi)

  if(this.active === false) {
    await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  }

  this.fromFavorite = options.isFromFavorite
  this.active = true
  UrlState.pushUrl()
  await this.panel.update()
}

PoiPanel.prototype.copy = function () {
  let copyUrl = document.getElementById('share-url')
  copyUrl.select()
  document.execCommand('copy')
  copyUrl.blur()
}

PoiPanel.prototype.center = function() {
  fire('fit_map', this.poi, {sidePanelOffset : true})
}

/* urlState interface implementation */

PoiPanel.prototype.store = function() {
  // TODO temporary way to store poi, will be replaced by poi id + slug & poi API
  if(this.poi && this.poi.name && this.active) {
    let slug = ExtendedString.slug(this.poi.name)
    return `${this.poi.id}@${slug}`
  }
  return ''
}

PoiPanel.prototype.restore = function(urlShard) {
  if(urlShard) {
    let id_slug_match = urlShard.match(/^([^@]+)@?(.*)/)
    if (id_slug_match) {
      let id = id_slug_match[1]
      this.restorePoi(id)
    }
  }
}

PoiPanel.prototype.backToFavorite = function() {
  PanelManager.toggleFavorite()
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
