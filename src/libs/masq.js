import Masq from 'masq-lib'

const Error = require('../adapters/error').default
const handleError = (fct, msg, e) => {
  Error.sendOnce('masq_store', fct, msg, e)
}

export default class MasqStore {
  constructor(config) {
    this.masq = null
    this.loginLink = null
    this.config = config
  }

  async getAllPois() {
    const list = await this.masq.list()

    const filteredKeys = Object.keys(list).reduce((filtered, k) => {
      if (Poi.isPoiCompliantKey(k)) {
        filtered.push(k)
      }
      return filtered
    }, [])

    if (filteredKeys.length === 0) {
      return []
    }

    const valuePromises = filteredKeys.map(k => {
      return this.masq.get(k)
    })

    try {
      return await Promise.all(valuePromises)
    } catch (e) {
      handleError('getAllPois', 'error getting pois', e)
      throw e
    }
  }

  async getUserInfo() {
    const username = await this.masq.getUsername()
    const profileImage = await this.masq.getProfileImage()
    return {
      username,
      profileImage
    }
  }

  async isLoggedIn() {
    return await Promise.resolve(this.masq && this.masq.isLoggedIn())
  }

  async login(apps) {
    // open Masq app window to connect to Masq
    window.open(this.loginLink)
    await this.masq.logIntoMasq(true)
  }

  async logout() {
    this.loginLink = await this.masq.getLoginLink()
    await this.masq.signout()
  }

  async onConnect () {
    this.masq = new Masq(this.config.title, this.config.desc, this.config.icon)
    if (this.masq.isLoggedIn()) {
      await this.masq.connectToMasq()
    } else {
      this.loginLink = await this.masq.getLoginLink()
    }
  }

  async has(k) {
    return Boolean(await this.get(k))
  }

  async get(k) {
    try {
      return await this.masq.get(k)
    } catch (e) {
      handleError('get', `error parsing item with key ${k}`, e)
      throw e
    }
  }

  async set(k, v) {
    try {
      await this.masq.put(k, v)
    } catch (e) {
      handleError('set', 'error setting item', e)
      throw e
    }
  }

  async clear() {
    handleError('clear', 'masq storage doesn\'t support clear method', e)
  }

  async del(k) {
    try {
      await this.masq.del(k)
    } catch (e) {
      handleError('del', 'error removing item', e)
      throw e
    }
  }
}
