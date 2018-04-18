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
      fire('open_favorite')
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
    return Poi.load(storedData[mapPoint])
  })
}

Favorite.prototype.open = async function() {
  this.active = true
  await this.getAll()
  await this.panel.update()
  await this.panel.removeClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')

}

Favorite.prototype.close = function() {
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = false
  fire('close_favorite_panel')
}

Favorite.prototype.go = async function(poi) {
  fire('mark_poi', poi)
  if(poi.bbox) {
    fire('fit_bounds', poi)
  } else {
    fire('fly_to', poi)
  }
  fire('close_favorite_panel')
  this.panel.addClassName(0.4, '.favorites_panel', 'favorites_panel--hidden')
  this.active = false
}

Favorite.prototype.add = function(poi) {
  this.favoritePois.push(poi)
  this.panel.update()
}

Favorite.prototype.del = function({poi, index}) {
  this.panel.addClassName(0.4, `#favorite_item_${index}`, 'favorite_item--removed')

  this.favoritePois = this.favoritePois.filter((favorite) => {
    if(favorite === poi) {
      fire('del_poi', poi)
      return false
    }
    return true
  })
//  this.panel.update()
  fire('close_favorite_panel')
}

export default Favorite
