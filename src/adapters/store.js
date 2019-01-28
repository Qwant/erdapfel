import nconf from '@qwant/nconf-getter'
import Error from '../adapters/error'
import {version} from '../../config/constants.yml'
import ExtendedString from "../libs/string";

let moduleConfig = nconf.get().store

const AbStore = require(`../libs/${moduleConfig.name}`)
const abstractStore = new AbStore(moduleConfig.endpoint)

function Store() {
  this.isRegisterd = false
  if(!window.__existingStore) {
    window.__existingStore = true
    listen('store_poi', (poi) => {
      this.add(poi)
    })
    listen('del_poi', (poi) => {
      this.del(poi)
    })
    listen('store_center', (loc) => {
      this.setLastLocation(loc)
    })
    listen('store_clear', () => {
      this.clear()
    })
  }
}

Store.prototype.getAllPois = async function() {
  try {
    return await abstractStore.getAllPois()
  } catch (e) {
    Error.sendOnce('store', 'getAllPois', 'error getting pois', e)
    throw e
  }
}

Store.prototype.getLastLocation = async function() {
  try {
    return await abstractStore.get(`qmaps_v${version}_last_location`)
  } catch (e) {
    Error.sendOnce('store', 'getLastLocation', 'error getting location', e)
    return null
  }
}

Store.prototype.setLastLocation = async function(loc) {
  try {
    return await abstractStore.set(`qmaps_v${version}_last_location`, loc)
  } catch (error) {
    Error.sendOnce('store', 'setLastLocation', 'error setting location', e)
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
    return ExtendedString.compareIgnoreCase(storedItem.name, prefix) === 0 /* start with */
  })
}

Store.prototype.has = async function(poi) {
  try {
    return await abstractStore.get(poi.getKey())
  } catch (e) {
    Error.sendOnce('store', 'has', 'error checking existing key', e)
  }
}

Store.prototype.add = function(poi) {
  abstractStore.set(poi.getKey(), poi.poiStoreLiteral()).then(function () {
  }).catch(function (e) {
    Error.sendOnce('store', 'add', 'error adding poi', e)
  })
}

Store.prototype.del = function(poi) {
  abstractStore.del(poi.getKey()).catch((e) => {
    Error.sendOnce('store', 'del', 'error deleting key', e)
  })
}

Store.prototype.clear = function () {
  abstractStore.clear().catch((e) => {
    Error.sendOnce('store', 'clear', 'error clearing store', e)
  })
}

export default Store
