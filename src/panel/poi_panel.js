import PoiPanelView from 'dot-loader!../views/poi_panel.dot'
import HourPanel from "./hour_panel";
import WikiPanel from "./wiki_panel";
import Panel from "../libs/panel";
import URI from "../libs/uri"
import Store from "../adapters/store"

const activePoiSections = require('../../config/active_poi_section.yml')

const store = new Store()

function PoiPanel() {
  listen('mark_poi', (poi) => {
    this.showInfoBox(poi)
  })
  listen('open_favorite', (poi) => {
    this.close()
  })
  this.URI = URI
  this.hourPanel = HourPanel
  this.wikiPanel = new WikiPanel()
  this.poi = null
  this.active = false
  this.panel = new Panel(this, PoiPanelView)
  this.activePoiSections = activePoiSections.pois
}

PoiPanel.prototype.toggleStorePoi = function() {
  if(this.poi.stored) {
    fire('del_poi', this.poi)
    this.poi.stored = false
  } else {
    fire('store_poi', this.poi)
    this.poi.stored = true
  }

  this.panel.update()
}

PoiPanel.prototype.toggle = async function() {
  if(this.active) {
    this.close()
  } else {
    this.open()
  }
}

PoiPanel.prototype.open = async function() {
  await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = true
  this.panel.update()
}

PoiPanel.prototype.close = async function() {
  await this.panel.addClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = false
  this.panel.update()
}

PoiPanel.prototype.showInfoBox = async function (poi) {
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

  this.poi.tags.find((tag) => {
    if(tag.name === 'wikidata') {
      this.wikiPanel.getData(tag)
    }
  })
}

export default PoiPanel
