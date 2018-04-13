import FavoritePanelView from '../views/favorites_panel.dot'
import Panel from '../libs/panel'
import Poi from '../mapbox/poi'
import Store from '../adapters/store'
import FilterPanel from './filter_panel'



function Favorite() {
  this.active = false
  this.favoritePois = []
  this.filterPanel = new FilterPanel()

  this.connectStore()

  listen('poi_open', () => {
    this.close()
  })

  listen('store_registered', () => {
    this.getAll()
  })

  listen('store_poi', (poi) => {
    this.add(poi)
  })

  this.panel = new Panel(this, FavoritePanelView)

  listen('toggle_favorite', () => {
    if(this.active) {
      this.close()
    } else {
      this.open()
    }
  })
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
  } else {
    fire('register_panel__show')
  }

}

Favorite.prototype.toggleFilter = function () {
  fire('toggle_favorite_panel')
}

Favorite.prototype.getAll = async function () {
  let storedData = {}
  try {
    storedData = this.store.getAll()
  } catch(e) {
    console.error(e)
  }
  this.favoritePois = Object.keys(storedData).map((mapPoint) => {
    return Poi.load(storeData[mapPoint])
  })
  this.panel.update()
}

Favorite.prototype.open = function() {
  this.panel.removeClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = true
}

Favorite.prototype.close = function() {
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = false
}

Favorite.prototype.go = async function(poi) {
  fire('mark_poi', poi)
  if(poi.bbox) {
    fire('fit_bounds', poi)
  } else {
    fire('fly_to', poi)
  }
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = false
}

Favorite.prototype.add = function(poi) {
  this.favoritePois.push(poi)
  this.panel.update()
}

Favorite.prototype.del = function(poi) {
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
