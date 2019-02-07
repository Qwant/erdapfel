import FavoritePanelView from '../views/favorites_panel.dot'
import Panel from '../libs/panel'
import Store from '../adapters/store'
import FilterPanel from './filter_panel'
import PanelManager from '../proxies/panel_manager'
import PoiStore from "../adapters/poi/poi_store";
import Telemetry from "../libs/telemetry";
import Error from '../adapters/error'
import layouts from "./layouts.js";

const poiSubClass = require('../mapbox/poi_subclass')

function Favorite(sharePanel) {
  this.active = false
  this.displayed = false
  this.favoritePois = []
  this.poiSubClass = poiSubClass
  this.filterPanel = new FilterPanel()
  this.sharePanel = sharePanel
  this.openMoreMenuPosition = -1

  document.addEventListener('click', () => {
    this.closeMoreMenu()
  })

  this.panel = new Panel(this, FavoritePanelView)
  this.isFavoritePanel = true
  PanelManager.register(this)

  listen('store_loggedIn', async () => {
    await this.getAll()
    this.panel.update()
  })

  listen('store_loggedOut', async () => {
    await this.getAll()
    this.panel.update()
  })

  listen('store_poi', (poi) => {
    this.add(poi)
  })
}

Favorite.prototype.toggleMore = function (position) {
  if(this.openMoreMenuPosition !== position) {
    this.closeMoreMenu()
  }
  this.openMoreMenu(position)
}

Favorite.prototype.openMoreMenu = function (position) {
  Telemetry.add(Telemetry.FAVORITE_OPEN_MORE)
  this.openMoreMenuPosition = position
  let menu = document.querySelector(`#favorite_more_${position}`)
  menu.classList.add('favorite_panel__item__more--active')
}

Favorite.prototype.closeMoreMenu = function () {
  let menu = document.querySelector(`#favorite_more_${this.openMoreMenuPosition}`)
  if(menu) {
    menu.classList.remove('favorite_panel__item__more--active')
    this.openMoreMenuPosition = -1
  }
}

Favorite.prototype.openShare = function (poi) {
  Telemetry.add(Telemetry.FAVORITE_SHARE)
  let url = poi.toAbsoluteUrl()
  this.sharePanel.open(url)
}

Favorite.prototype.isDisplayed = function () {
  return this.displayed
}

Favorite.prototype.toggle = function() {
  if(this.active) {
    this.close()
  } else {
    this.open()
  }
}

Favorite.prototype.getAll = async function () {
  this.favoritePois = await PoiStore.getAll()
}

Favorite.prototype.open = async function() {
  Telemetry.add(Telemetry.FAVORITE_OPEN)
  this.displayed = true
  await this.getAll()
  await this.panel.update()
  await this.panel.removeClassName(0.3, '.favorites_panel', 'favorites_panel--hidden')
  this.active = true
}

Favorite.prototype.close = function() {
  this.closeMoreMenu()
  this.active = false
  this.displayed = false
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  fire('close_favorite_panel')
}

Favorite.prototype.go = async function(poiStore) {
  Telemetry.add(Telemetry.FAVORITE_GO)
  fire('map_mark_poi', poiStore)
  fire('fit_map', poiStore, layouts.FAVORITE)
  this.panel.addClassName(0.3, '.favorites_panel', 'favorites_panel--hidden')
  PanelManager.loadPoiById(poiStore.id, {isFromFavorite : true})
  this.active = false
}

Favorite.prototype.add = function(poi) {
  Telemetry.add(Telemetry.FAVORITE_SAVE)
  this.favoritePois.push(poi)
  this.panel.update()
}

Favorite.prototype.del = async function({poi, index}) {
  Telemetry.add(Telemetry.FAVORITE_DELETE)

  await this.panel.addClassName(0.3, `#favorite_item_${index}`, 'favorite_item--removed')

  this.favoritePois = this.favoritePois.filter((favorite) => {
    if(favorite === poi) {
      this.store.del(poi)
      return false
    }
    return true
  })

  this.panel.update()
}

export default Favorite
