import PoiPanelView from '../views/poi_panel.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import PoiBlocContainer from './poi_bloc/poi_bloc_container'
import UrlState from '../proxies/url_state'
import HotLoadPoi from "../adapters/poi/hotload_poi";
import Telemetry from "../libs/telemetry";
import headerPartial from '../views/poi_partial/header.dot'
import MinimalHourPanel from './poi_bloc/opening_minimal'
import SceneState from "../adapters/scene_state";
import {paramTypes} from '../proxies/url_shard'
import layouts from "./layouts.js";
import nconf from "../../local_modules/nconf_getter";
import MasqFavoriteModal from "../modals/masq_favorite_modal";

const poiSubClass = require('../mapbox/poi_subclass')

const store = new Store()
const masqFavoriteModal = new MasqFavoriteModal()

function PoiPanel(sharePanel) {
  this.isPoiComplient = true /* Poi Compliant */
  this.poi = null
  this.active = false
  this.displayed = false
  this.poiSubClass = poiSubClass
  this.list = null
  this.PoiBlocContainer = PoiBlocContainer
  this.panel = new Panel(this, PoiPanelView)
  this.sharePanel = sharePanel
  this.lang = window.getBaseLang().code
  this.card = true
  this.headerPartial = headerPartial
  this.minimalHourPanel = new MinimalHourPanel()
  this.sceneState = SceneState.getSceneState()
  this.isDirectionActive = nconf.get().direction.enabled
  PanelManager.register(this)
  UrlState.registerUrlShard(this, 'place', paramTypes.RESOURCE)
  this.isMasqEnabled = nconf.get().masq.enabled

  store.onToggleStore(async () => {
    if (this.poi) {
      this.poi.stored = await isPoiFavorite(this.poi)
      this.panel.update()
      endLoad()
    }
  })

  store.eventTarget.addEventListener('poi_added', async () => {
    if (this.poi && !this.poi.stored) {
      this.poi.stored = await isPoiFavorite(this.poi)
      this.panel.update()
      endLoad()
    }
  })
}

PoiPanel.prototype.toggleStorePoi = async function() {
  if(this.poi.stored) {
    this.panel.removeClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star-filled')
    this.panel.addClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star')
    this.poi.stored = false
    await store.del(this.poi)
  } else {

    this.panel.removeClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star')
    this.panel.addClassName(.2, '.poi_panel__actions__icon__store', 'icon-icon_star-filled')

    if (this.isMasqEnabled) {
      const isLoggedIn = await store.isLoggedIn()
      if (!isLoggedIn) {
        masqFavoriteModal.open()
        await masqFavoriteModal.waitForClose()
      }
    }

    this.poi.stored = true
    await store.add(this.poi)
  }
}

PoiPanel.prototype.isDisplayed = function() {
  return this.active
}

PoiPanel.prototype.closeAction = function() {
  fire('clean_marker')
  PanelManager.resetLayout()
}

PoiPanel.prototype.close = async function() {
  await this.panel.addClassName(.2,'.poi_panel', 'poi_panel--hidden')
  this.active = false
  this.panel.update()
  this.sceneState.unsetPoiID()
  UrlState.pushUrl()
  PanelManager.openService()
}

PoiPanel.prototype.restorePoi = async function (id) {
  Telemetry.add(Telemetry.POI_RESTORE)
  let hotLoadedPoi = new HotLoadPoi()
  if(hotLoadedPoi.id === id) {
    this.poi = hotLoadedPoi
    window.execOnMapLoaded(() => {
      fire('map_mark_poi', this.poi)
      fire('fit_map', this.poi, layouts.POI)
    })
    this.poi.stored = await isPoiFavorite(this.poi)
    this.active = true
    this.sceneState.setPoiId(this.poi.id)
    await this.panel.removeClassName(.2,'.poi_panel', 'poi_panel--hidden')
    await this.panel.update()
    this.minimalHourPanel.set(this.poi)
  }
}

PoiPanel.prototype.setPoi = async function (poi, options = {}) {
  this.poi = poi
  this.card = true
  this.poi.stored = await isPoiFavorite(this.poi)
  this.PoiBlocContainer.set(this.poi)
  this.fromFavorite = false
  this.fromList = false
  if(options && options.isFromFavorite){
    this.fromFavorite = options.isFromFavorite
  }
  if(options && options.isFromList){
    this.fromList = options.isFromList
  }
  if(options && options.list){
    this.list = options.list
  }
  this.active = true
  UrlState.pushUrl()
  this.sceneState.setPoiId(this.poi.id)
  await this.panel.update()
  await this.minimalHourPanel.set(this.poi)
  endLoad()
}

PoiPanel.prototype.center = function() {
  Telemetry.add(Telemetry.POI_GO)
  fire('fit_map', this.poi, layouts.POI)
}

PoiPanel.prototype.openShare = function () {
  Telemetry.add(Telemetry.POI_SHARE)
  this.sharePanel.open(this.poi.toAbsoluteUrl())
}

/* urlState interface implementation */

PoiPanel.prototype.store = function() {
  // TODO temporary way to store poi, will be replaced by poi id + slug & poi API
  if(this.poi && this.poi.name && this.active) {
    return this.poi.toUrl()
  }
  return ''
}

PoiPanel.prototype.restore = async function(urlShard) {
  if(urlShard) {
    let idSlugMatch = urlShard.match(/^([^@]+)@?(.*)/)
    if (idSlugMatch && window.hotLoadPoi) {
      let id = idSlugMatch[1]
      await this.restorePoi(id)
      endLoad()
    }
  }
}

PoiPanel.prototype.showDetail = function() {
  this.card = false
  this.panel.update()
  endLoad()
}

PoiPanel.prototype.backToFavorite = function() {
  PanelManager.toggleFavorite()
}

PoiPanel.prototype.backToList = function() {
  this.close();
  this.list.open();
}

PoiPanel.prototype.openDirection = function () {
  PanelManager.toggleDirection({poi : this.poi})
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

/* loadable */

function endLoad() {
  let loadingPanel = document.querySelector('#poi-loading-panel')
  loadingPanel.style.animation = 'disappear 1s forwards'

  setTimeout(() => {
    let loadingPanel = document.querySelector('#poi-loading-panel')
     loadingPanel.style.display = 'none'
  }, 200)
}

export default PoiPanel
