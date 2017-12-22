import Mask from '../libs/mask'
const masqStore = new Mask()

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
  return new Promise((resolve, reject) => {
    masqStore.onConnect().then(() => {
      masqStore.getAll().then((maskData) => {
        resolve(maskData)
      }).catch(function (error) {
        reject(error)
      })
    }).catch(function (error) {
      reject(error)
    })
  })

}

Store.prototype.getPrefixes = function (prefix) {
  return new Promise((resolve) => {
    const prefixes = []
      masqStore.getAll().then((items) => {
        Object.keys(items).forEach((itemKey) => {
          let item = items[itemKey]
          const rePrefix = new RegExp(`${prefix}`, 'i')
          if(rePrefix.exec(item.title))
          prefixes.push(item)
        })
        resolve(prefixes)
    })
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
