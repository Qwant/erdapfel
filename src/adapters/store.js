import nconf from '@qwant/nconf-getter'
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

Store.prototype.getAllPois = async function() {
  try {
    return await abstractStore.getAllPois()
  } catch (error) {
    fire('error_h' , 'store ' + error)
    throw error
  }
}

Store.prototype.isRegistered = async function () {
  try {
    return await abstractStore.getAllPois() !== null
  } catch (error) {
    return false
  }
}

Store.prototype.onConnect = async function () {
  return await abstractStore.onConnect()
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
  const storedItems = await abstractStore.getAllPois()
  return storedItems.filter((storedItem) => {
    const rePrefix = new RegExp(`^${prefix}`, 'i')
    return rePrefix.exec(storedItem.name)
  })
}

Store.prototype.has = async function(poi) {
  try {
    return await abstractStore.get(poi.getKey())
  } catch (error) {
    fire('error_h', 'store ' + err )
    throw err
  }
}

Store.prototype.add = function(poi) {
  abstractStore.set(poi.getKey(), poi.poiStoreLiteral()).then(function () {
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
