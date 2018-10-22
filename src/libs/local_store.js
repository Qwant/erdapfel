function LocalStore() {}

LocalStore.prototype.getAllPois = async function () {
  return new Promise((resolve) => {
    try {
      const items = Object.keys(localStorage).reduce((filtered, k) => {
        if (Poi.isPoiCompliantKey(k)) {
          filtered.push(JSON.parse(localStorage.getItem(k)))
        }
        return filtered
      }, [])
      resolve(items)
    } catch (err) {
      console.error(`localStorage ${err}`)
      resolve([])
    }
  })
}

LocalStore.prototype.register = async function() {
  console.log('local storage doesn\'t support register method')
  return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.onConnect = async function () {
  return new Promise((resolve) => {
    resolve()
  })
}

LocalStore.prototype.get = async function(k) {
  return new Promise((resolve) => {
    try {
      resolve(JSON.parse(localStorage.getItem(k)))
    } catch (err) {
      console.error(`localStorage ${err}`)
      resolve(null)
    }
  })
}

LocalStore.prototype.set = async function(k, v) {
 try {
   localStorage.setItem(k,JSON.stringify(v))
 } catch (err) {
   console.error(`localStorage ${err}`)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.clear = function() {
 try {
   localStorage.clear()
 } catch (err) {
   console.error(`localStorage ${err}`)
 }
 return new Promise((resolve)=>{resolve()})
}

LocalStore.prototype.del = function(k) {
  try {
    localStorage.removeItem(k)
  } catch (err) {
    console.error(`localStorage ${err}`)
  }
  return new Promise((resolve)=>{resolve()})
}

module.exports = LocalStore
