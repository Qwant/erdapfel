import nconf from '@qwant/nconf-getter'

let moduleConfig = nconf.get().store

const AbStore = require(`../libs/${moduleConfig.name}`)
const abstractStore = new AbStore()



function Store() {
  this.isRegisterd = false

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

Store.prototype.getAll = async function() {
  return new Promise((resolve, reject) => {
    abstractStore.getAll().then((masqData) => {
      resolve(masqData)
    }).catch(function (error) {
      fire('error_h' , 'store ' + error)
      reject(error)
    })
  })
}

Store.prototype.onConnect = async function () {
  let regParams = {
    endpoint: moduleConfig.endpoint,
    url: window.location.origin + window.location.pathname,
    name: moduleConfig.masq.name,
    description: moduleConfig.masq.description,
    icon: moduleConfig.masq.icon
  }
  return abstractStore.onConnect(regParams)
}

Store.prototype.getPrefixes = async function (prefix) {
  return new Promise((resolve, reject) => {
    const prefixes = []
    abstractStore.getAll().then((items) => {
        Object.keys(items).forEach((itemKey) => {
          let item = items[itemKey]
          const rePrefix = new RegExp(`${prefix}`, 'i')
          if(rePrefix.exec(item.title))
          prefixes.push(item)
        })
        resolve(prefixes)
    }).catch((e) => {
      reject(e)
    })
  })
}

Store.prototype.has = async function(poi) {
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
