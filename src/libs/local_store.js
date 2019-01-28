const Error = require('../adapters/error').default

function LocalStore() {}

LocalStore.prototype.getAllPois = function() {
  return new Promise((resolve) => {
    let localStorageKeys = []
    try {
      localStorageKeys = Object.keys(localStorage)
    } catch (e) {
      Error.sendOnce('local_store', 'getAllPois', 'error getting pois keys', e)
      resolve([])
      return
    }
    const items = localStorageKeys.reduce((filtered, k) => {
      if (Poi.isPoiCompliantKey(k)) {
        try {
          let poi = JSON.parse(localStorage.getItem(k))
          filtered.push(poi)
        } catch (e) {
          Error.sendOnce('local_store', 'getAllPois', 'error getting pois', e)
        }
      }
      return filtered
    }, [])
    resolve(items)
  })
}

LocalStore.prototype.getUserInfo = function() {
  return Promise.resolve(null)
}

LocalStore.prototype.registerApp = function() {
  console.log('local storage doesn\'t support register method')
  return Promise.resolve()
}

LocalStore.prototype.unregisterApp = function() {
  return Promise.resolve()
}

LocalStore.prototype.isRegistered = function() {
  return Promise.resolve(true)
}

LocalStore.prototype.onConnect = function () {
  return Promise.resolve()
}

LocalStore.prototype.has = async function(k) {
  return !!(await this.get(k))
}

LocalStore.prototype.get = function(k) {
  return new Promise((resolve) => {
    try {
      resolve(JSON.parse(localStorage.getItem(k)))
    } catch (e) {
      Error.sendOnce('local_store', 'get', `error parsing item with key ${k}`, e)
      resolve(null)
    }
  })
}

LocalStore.prototype.set = function(k, v) {
 try {
   localStorage.setItem(k,JSON.stringify(v))
 } catch (e) {
   Error.sendOnce('local_store', 'set', 'error setting item', e)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.clear = function() {
 try {
   localStorage.clear()
 } catch (e) {
   Error.sendOnce('local_store', 'clear', 'error clearing store', e)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.del = function(k) {
  try {
    localStorage.removeItem(k)
  } catch (e) {
    Error.sendOnce('local_store', 'del', 'error removing item', e)
  }
  return new Promise((resolve)=>{resolve()})
}

module.exports = LocalStore
