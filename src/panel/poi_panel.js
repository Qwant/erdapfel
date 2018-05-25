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
  UrlState.register(this)
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
  UrlState.updateUrl()
  await this.panel.update()
}


/* urlState interface implementation */

PoiPanel.prototype.store = function() {
  return `place/${ExtendedString.slug(this.poi.name)}`
}

PoiPanel.prototype.restore = function(url) {
  let urlParams = url.split('/')
  urlParams.forEach((param, i) => {
    if(param === 'place' && urlParams.length > i) {
      let slug = urlParams[i + 1]
      this.setPoi({
        name : slug
      })
    }
  })
}

export default PoiPanel
