import nconf from 'nconf-getter'
let moduleConfig = nconf.get().store

const AbStore = require(`../libs/${moduleConfig.name}`)
const abstractStore = new AbStore(moduleConfig.endpoint)

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

Store.prototype.isRegistered = async function () {
  return new Promise((resolve) => {
    abstractStore.getAll()
      .then(() => resolve(true))
      .catch((e) => {
      if(e.message === 'UNREGISTERED') {
        resolve(false)
      }
    })
  })
}

Store.prototype.onConnect = async function () {
  return abstractStore.onConnect()
}

Store.prototype.register = async function () {
  let regParams = {
    endpoint: moduleConfig.endpoint,
    url: window.location.origin + window.location.pathname,
    title: moduleConfig.masq.title,
    desc: moduleConfig.masq.desc,
    icon: moduleConfig.masq.icon
  }
  return abstractStore.registerApp(regParams)
}


Store.prototype.getPrefixes = async function (prefix) {
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
