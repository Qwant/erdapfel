function LocalStore() {}

LocalStore.prototype.getAll = function () {
  return new Promise((resolve) => {
    try {
      const items = Object.keys(localStorage).map((k) => {
        return JSON.parse(localStorage.getItem(k))
      })
      resolve(items)
    } catch (err) {
      console.error(`localStorage ${err}`)
      resolve([])
    }
  })
}

LocalStore.prototype.onConnect = function () {
  return new Promise((resolve) => {
    resolve()
  })
}

LocalStore.prototype.get = function(k) {
  return new Promise((resolve) => {
    try {
      resolve(JSON.parse(localStorage.getItem(k)))
    } catch (err) {
      console.error(`localStorage ${err}`)
      resolve(null)
    }
  })
}

LocalStore.prototype.set = function(k, v) {
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
