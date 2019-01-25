const Masq = require('masq-lib')

const Error = require('../adapters/error').default
const handleError = (fct, msg, e) => {
  Error.sendOnce('masq_store', fct, msg, e)
}

function MasqStore(config) {
  this.masq = null
  this.loginLink = null
  this.config = config
}

MasqStore.prototype.getAllPois = async function() {
  const list = await this.masq.list()

  const filteredKeys = Object.keys(list).reduce((filtered, k) => {
    if (Poi.isPoiCompliantKey(k)) {
      filtered.push(k)
    }
    return filtered
  }, [])

  if (filteredKeys.length === 0) {
    return Promise.resolve([])
  }

  const valuePromises = filteredKeys.map(k => {
    return this.masq.get(k)
  })

  const values = await Promise.all(valuePromises).catch(
    (e) => {
      handleError('getAllPois', 'error getting pois', e)
      throw e
    })

  return values
}

MasqStore.prototype.isRegistered = function() {
  return Promise.resolve(this.masq && this.masq.isLoggedIn())
}

MasqStore.prototype.registerApp = async function(apps) {
  // connect to Masq
  window.open(this.loginLink)
  await this.masq.logIntoMasq(false)
}

MasqStore.prototype.onConnect = async function () {
  // executed when maps is opened
  this.masq = new Masq(this.config.title, this.config.desc, this.config.icon)
  if (this.masq.isLoggedIn()) {
    await this.masq.connectToMasq()
  } else {
    this.loginLink = await this.masq.getLoginLink()
  }

  return
}

MasqStore.prototype.has = async function(k) {
  return !!(await this.get(k))
}

MasqStore.prototype.get = async function(k) {
  const value = await this.masq.get(k).catch(
    (e) => {
      handleError('get', `error parsing item with key ${k}`, e)
      throw e
    })
  return value
}

MasqStore.prototype.set = async function(k, v) {
  await this.masq.put(k, v).catch(
    (e) => {
      handleError('set', 'error setting item', e)
      throw e
    })
  return
}

MasqStore.prototype.clear = function() {
  handleError('clear', 'masq storage doesn\'t support clear method', e)
  return Promise.resolve()
}

MasqStore.prototype.del = async function(k) {
  await this.masq.del(k).catch(
    (e) => {
      handleError('del', 'error removing item', e)
      throw e
    })
  return
}

module.exports = MasqStore
