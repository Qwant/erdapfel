let moduleConfig = require("json-loader!yaml-loader!../../config/modules.yml")
const AbStore = require(`../libs/${moduleConfig.store.name}`)
const abstractStore = new AbStore(moduleConfig.store.remote)
const isRegisterd = false

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
    abstractStore.onConnect().then(() => {
      abstractStore.getAll().then((maskData) => {
        resolve(maskData)
      }).catch(function (error) {
        fire('error_h' , 'store ' + error)
        reject(error)
      })
    }).catch(function (error) {
      fire('error_h' , 'store ' + error)
      reject(error)
    })
  })
}

Store.prototype.register = function () {
    abst3actStore.registerApp(regParams).then(function (e) {
    })
}


Store.prototype.getPrefixes = function (prefix) {
  return new Promise((resolve) => {
    const prefixes = []
    abstractStore.getAll().then((items) => {
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
    abstractStore.get(poi.getKey()).then((foundPoi) => {
      resolve(foundPoi)
    }).catch((err) => {
      fire('error_h', 'store ' + err )
      resolve()
    })
  })
}

Store.prototype.add = function(poi) {
  abstractStore.set(poi.getKey(), poi.store()).then(function () {
  }).catch(function (err) {
    fire('error_h', 'store ' + err)
  })
}

Store.prototype.del = function(poi) {
  abstractStore.del(poi.getKey()).catch((err) => {
    fire('error_h', 'store ' + err)
  })
}

Store.prototype.clear = function () {
  abstractStore.clear().catch((err) => {
    fire('error_h', 'store ' + err)
  })
}


export default Store
