import FavoritePanelView from '../views/favorites_panel.dot'
import Panel from '../libs/panel'
import Poi from '../mapbox/poi'
import Store from '../adapters/store'
import FilterPanel from './filter_panel'
import PanelManager from '../proxies/panel_manager'
import Slide from '../libs/slide'
const poiSubClass = require('../mapbox/poi_subclass')

function Favorite(sharePanel) {
  this.active = false
  this.displayed = false
  this.favoritePois = []
  this.poiSubClass = poiSubClass
  this.filterPanel = new FilterPanel()
  this.sharePanel = sharePanel
  this.connectStore()
  this.openMoreMenuPosition = -1

  document.addEventListener('click', () => {
    this.closeMoreMenu()
  })

  listen('store_registered', () => {
    this.getAll()
  })

  listen('store_poi', (poi) => {
    this.add(poi)
  })

  this.panel = new Panel(this, FavoritePanelView)
  this.isFavoritePanel = true
  PanelManager.register(this)
  this.slide = new Slide(this, '#favorite-panel-handle', '.favorites_panel', {bounds : {top : 0, bottom : 30}})
}

Favorite.prototype.toggleMore = function (position) {
  if(this.openMoreMenuPosition !== position) {
    this.closeMoreMenu()
  }
  this.openMoreMenu(position)
}

Favorite.prototype.openMoreMenu = function (position) {
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

Favorite.prototype.connectStore = async function () {
  this.store = new Store()
  try {
    await this.store.onConnect()
  } catch(e) {
    console.error(e)
    fire('register_panel__show')
  }
  let registered = false
  try {
    registered = await this.store.isRegistered()
  } catch(e) {
    console.error(e)
    fire('register_panel__show')
  }

  if(registered) {
    this.getAll()
    this.panel.update()
  } else {
    fire('register_panel__show')
  }
}

Favorite.prototype.getAll = async function () {
  let storedData = {}
  try {
    storedData = await this.store.getAll()
  } catch(e) {
    console.error(e)
  }
  this.favoritePois = Object.keys(storedData).map((mapPoint) => {
    return Poi.storeLoad(storedData[mapPoint])
  })
}

Favorite.prototype.open = async function() {
  this.displayed = true
  PanelManager.notify()
  await this.getAll()
  await this.panel.update()
  await this.panel.removeClassName(0.3, '.favorites_panel', 'favorites_panel--hidden')
  this.active = true
  this.slide.initListeners()
}

Favorite.prototype.close = function() {
  this.closeMoreMenu()
  this.active = false
  this.displayed = false
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  fire('close_favorite_panel')
  PanelManager.notify()
}

Favorite.prototype.go = async function(storePoi) {
  fire('map_mark_poi', storePoi)
  fire('fit_map', storePoi, {sidePanelOffset : true})
  this.panel.addClassName(0.3, '.favorites_panel', 'favorites_panel--hidden')
  PanelManager.loadPoiById(storePoi.id, {isFromFavorite : true})
  this.active = false
}

Favorite.prototype.add = function(poi) {
  this.favoritePois.push(poi)
  this.panel.update()
}

Favorite.prototype.del = async function({poi, index}) {
  await this.panel.addClassName(0.3, `#favorite_item_${index}`, 'favorite_item--removed')

  this.favoritePois = this.favoritePois.filter((favorite) => {
    if(favorite === poi) {
      fire('del_poi', poi)
      return false
    }
    return true
  })

  this.panel.update()
}

export default Favorite
