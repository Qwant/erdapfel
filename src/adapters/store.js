import Mask from '../libs/mask'
const masqStore = new Mask('http://127.0.0.1:8081/')

function Store() {
  listen('store_poi', (poi) => {
    this.add(poi)
  })
  listen('del_poi', (poi) => {
    this.del(poi)
  })
  listen('store_clear', () => {
    this.clear()
  })
}

Store.prototype.getAll = function() {
  masqStore.onConnect().then(() => {
    masqStore.getAll().then((maskData) => {
      fire('favorite_loaded', maskData)
    }).catch(function (error) {
      fire('error', error)
    })
  }).catch(function (error) {
    fire('error', error)
  })
}

Store.prototype.has = function(poi) {
  return new Promise((resolve) => {
    masqStore.get(poi.getKey()).then((foundPoi) => {
      resolve(foundPoi)
    })
  })
}

Store.prototype.add = function(poi) {
  masqStore.set(poi.getKey(), poi.store()).then(function () {
  }).catch(function (err) {
    console.error(err)
  })
}

Store.prototype.del = function(poi) {
  masqStore.del(poi.getKey())
}

Store.prototype.clear = function () {
  masqStore.clear()
}


export default Store