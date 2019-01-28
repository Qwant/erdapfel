import nconf from '@qwant/nconf-getter'
import Error from '../adapters/error'
import {version} from '../../config/constants.yml'
import ExtendedString from "../libs/string";

let moduleConfig = nconf.get().store

const AbStore = require(`../libs/${moduleConfig.name}`)
const abstractStore = new AbStore(moduleConfig[moduleConfig.name])

// When not registered fallback to another store that does not need registration
const FallbackStore = require(`../libs/${moduleConfig.fallback}`)
const fallbackStore = new FallbackStore(moduleConfig[moduleConfig.fallback])

const checkRegistered = async () => {
  return (await abstractStore.isRegistered())
}

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

Store.prototype.getUserInfo = async function() {
  try {
    if (! (await checkRegistered())) {
      throw new Error('Not registered')
    }
    return await abstractStore.getUserInfo()
  } catch (e) {
    Error.sendOnce('store', 'getAllPois', 'error getting pois', e)
    throw e
  }
}

Store.prototype.getAllPois = async function() {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.getAllPois()
    }
    return await abstractStore.getAllPois()
  } catch (e) {
    Error.sendOnce('store', 'getAllPois', 'error getting pois', e)
    throw e
  }
}

Store.prototype.getLastLocation = async function() {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.get(`qmaps_v${version}_last_location`)
    }
    console.log('registered')
    return await abstractStore.get(`qmaps_v${version}_last_location`)
  } catch (e) {
    Error.sendOnce('store', 'getLastLocation', 'error getting location', e)
    return null
  }
}

Store.prototype.setLastLocation = async function(loc) {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.set(`qmaps_v${version}_last_location`, loc)
    }
    return await abstractStore.set(`qmaps_v${version}_last_location`, loc)
  } catch (e) {
    Error.sendOnce('store', 'setLastLocation', 'error setting location', e)
  }
}

Store.prototype.isRegistered = async function () {
  return await abstractStore.isRegistered()
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

Store.prototype.unregister = async function () {
  return abstractStore.unregisterApp()
}

Store.prototype.getPrefixes = async function (prefix) {
  const storedItems = await abstractStore.getAllPois()
  return storedItems.filter((storedItem) => {
    return ExtendedString.compareIgnoreCase(storedItem.name, prefix) === 0 /* start with */
  })
}

Store.prototype.has = async function(poi) {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.has(poi.getKey())
    }
    return await abstractStore.has(poi.getKey())
  } catch (e) {
    Error.sendOnce('store', 'has', 'error checking existing key', e)
  }
}

Store.prototype.add = async function(poi) {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.set(poi.getKey(), poi.poiStoreLiteral())
    }
    await abstractStore.set(poi.getKey(), poi.poiStoreLiteral())
  } catch(e) {
    Error.sendOnce('store', 'add', 'error adding poi', e)
  }
}

Store.prototype.del = async function(poi) {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.del(poi.getKey())
    }
    await abstractStore.del(poi.getKey())
  } catch(e) {
    Error.sendOnce('store', 'del', 'error deleting key', e)
  }
}

Store.prototype.clear = async function () {
  try {
    if (! (await checkRegistered())) {
      return await fallbackStore.clear()
    }
    await abstractStore.clear()
  } catch(e) {
    Error.sendOnce('store', 'clear', 'error clearing store', e)
  }
}

export default Store
