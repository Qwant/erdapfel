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

    this.initPromise = this.init()
    this.initialized = false
  }

  async init() {
    this.masq = new Masq(this.config.title, this.config.desc, this.config.icon)
    if (this.masq.isLoggedIn()) {
      await this.masq.connectToMasq()
    } else {
      this.loginLink = await this.masq.getLoginLink()
    }
    this.initialized = true
  }

  async checkInit(target, name, descriptor) {
    if (!this.initialized) {
      await this.initPromise
    }
  }

  async login(apps) {
    await this.checkInit()
    // open Masq app window to connect to Masq
    window.open(this.loginLink)
    await this.masq.logIntoMasq(true)
  }

  async logout() {
    await this.checkInit()
    this.loginLink = await this.masq.getLoginLink()
    await this.masq.signout()
  }

  isLoggedIn() {
    return Boolean(this.masq && this.masq.isLoggedIn())
  }

  async getUserInfo() {
    await this.checkInit()
    const username = await this.masq.getUsername()
    const profileImage = await this.masq.getProfileImage()
    return {
      username,
      profileImage
    }
  }

  async get(k) {
    await this.checkInit()
    try {
      return await this.masq.get(k)
    } catch (e) {
      handleError('get', `error parsing item with key ${k}`, e)
      throw e
    }
  }

  async getAllPois() {
    await this.checkInit()
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

  async has(k) {
    await this.checkInit()
    return Boolean(await this.get(k))
  }

  async set(k, v) {
    await this.checkInit()
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
    await this.checkInit()
    try {
      await this.masq.del(k)
    } catch (e) {
      handleError('del', 'error removing item', e)
      throw e
    }
  }
}
