function LocalStore() {}

LocalStore.prototype.getAllPois = function() {
  return new Promise((resolve) => {
    const items = Object.keys(localStorage).reduce((filtered, k) => {
      if (Poi.isPoiCompliantKey(k)) {
        try {
          let poi = JSON.parse(localStorage.getItem(k))
          filtered.push(poi)
        } catch (error) {
          fire('error_h', `local store getAllPoi error ${error}`)
        }
      }
      return filtered
    }, [])
    resolve(items)
  })
}

LocalStore.prototype.register = function() {
  console.log('local storage doesn\'t support register method')
  return Promise.resolve()
}

LocalStore.prototype.onConnect = function () {
  return Promise.resolve()
}

LocalStore.prototype.get = function(k) {
  return new Promise((resolve) => {
    try {
      resolve(JSON.parse(localStorage.getItem(k)))
    } catch (error) {
      fire('error_h', `local store get error ${error}`)
      resolve(null)
    }
  })
}

LocalStore.prototype.set = function(k, v) {
 try {
   localStorage.setItem(k,JSON.stringify(v))
 } catch (error) {
   fire('error_h', `local store set error ${error}`)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.clear = function() {
 try {
   localStorage.clear()
 } catch (error) {
   fire('error_h', `local store clear error ${error}`)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.del = function(k) {
  try {
    localStorage.removeItem(k)
  } catch (error) {
    fire('error_h', `local store delete error ${error}`)
  }
  return new Promise((resolve)=>{resolve()})
}

module.exports = LocalStore
