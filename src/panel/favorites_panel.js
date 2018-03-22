import FavoritePanelView from 'dot-loader!../views/favorites_panel.dot'
import Panel from '../libs/panel'
import Poi from '../mapbox/poi'
import Store from '../adapters/store'
import FilterPanel from './filter_panel'

const store = new Store()

function Favorite() {
  this.active = false
  this.favoritePois = []
  this.filterPanel = new FilterPanel()
  store.onConnect()
    .then(() => store.isRegistered())
    .then((registered) => {
      if(registered) {
        this.getAll()
      } else {
        fire('register_panel__show')
      }
    })

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

  listen('open_favorite', () => {
    this.open()
  })
}

Favorite.prototype.toggleFilter = function () {
  fire('toggle_favorite_panel')
}


Favorite.prototype.getAll = function () {
  store.getAll().then((storeData) => {
    this.favoritePois = Object.keys(storeData).map((mapPoint) => {
      return Poi.load(storeData[mapPoint])
    })
    this.panel.update()
  })
}

Favorite.prototype.open = function() {
  this.panel.removeClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = true
}

Favorite.prototype.close = function() {
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = false
}

Favorite.prototype.go = function(poi) {
  fire('mark_poi', poi)
  if(poi.bbox) {
    fire('fit_bounds', poi)
  } else {
    fire('fly_to', poi)
  }
  this.panel.animate(0.4, '.favorites_panel', {left : '-280px'}).then(() => {
    this.active = false
  })
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
