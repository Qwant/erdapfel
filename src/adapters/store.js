import nconf from '@qwant/nconf-getter'
import Error from '../adapters/error'
import {version} from '../../config/constants.yml'
import ExtendedString from "../libs/string";
import LocalStore from "../libs/local_store"
import MasqStore from "../libs/masq"

export default class Store {

  constructor() {
    // get store from window if already initialized
    if (window.__store) {
      return window.__store
    }
    // if store not initialized, use this
    window.__store = this

    // init stores
    this.localStore = new LocalStore()
    this.loggedIn = false
    this.abstractStore = this.localStore
    this.masqConfig = nconf.get().masq
    this.masqStore = new MasqStore(this.masqConfig)
    this.masqInitPromise = this.masqStore.onConnect()
    this.masqInitialized = false

    // use abstract store for each operation that
    // should use masqStore when logged in and localStore when not logged in

    return this
  }

  async checkInit(target, name, descriptor) {
    if (!this.masqInitialized) {
      await this.masqInitPromise
      this.masqInitialized = true

      const alreadyLoggedIntoMasq = await this.masqStore.isLoggedIn()
      if (alreadyLoggedIntoMasq) {
        this.abstractStore = this.masqStore
      }
    }
  }

  async login() {
    await this.checkInit()
    try {
      const loginParams = {
        endpoint: this.masqConfig.endpoint,
        url: window.location.origin + window.location.pathname,
        title: this.masqConfig.title,
        desc: this.masqConfig.desc,
        icon: this.masqConfig.icon
      }

      await this.masqStore.login(loginParams)
    } catch (e) {
      Error.sendOnce('store', 'login', 'error logging in', e)
      throw e
    }

    // login was successful, use masqStore as abstractStore until logout
    this.loggedIn = true
    this.abstractStore = this.masqStore
    fire('store_loggedIn')
  }

  async logout() {
    await this.checkInit()
    try {
      await this.masqStore.logout()
    } catch (e) {
      Error.sendOnce('store', 'logout', 'error logging out', e)
      throw e
    }
    this.loggedIn = false
    this.abstractStore = this.localStore
    fire('store_loggedOut')
  }

  async isLoggedIn() {
    await this.checkInit()
    try {
      return await this.masqStore.isLoggedIn()
    } catch (e) {
      Error.sendOnce('store', 'isLoggedIn', 'error checking if logged in', e)
      throw e
    }
  }

  async getUserInfo() {
    await this.checkInit()
    try {
      return await this.masqStore.getUserInfo()
    } catch (e) {
      Error.sendOnce('store', 'getUserInfo', 'error getting user info', e)
      throw e
    }
  }

  async getAllPois() {
    await this.checkInit()
    try {
      return await this.abstractStore.getAllPois()
    } catch (e) {
      Error.sendOnce('store', 'getAllPois', 'error getting pois', e)
      throw e
    }
  }

  async getLastLocation() {
    await this.checkInit()
    try {
      return await this.abstractStore.get(`qmaps_v${version}_last_location`)
    } catch (e) {
      Error.sendOnce('store', 'getLastLocation', 'error getting last location', e)
      return null
    }
  }

  async setLastLocation(loc) {
    await this.checkInit()
    try {
      return await this.abstractStore.set(`qmaps_v${version}_last_location`, loc)
    } catch (e) {
      Error.sendOnce('store', 'setLastLocation', 'error setting location', e)
      throw e
    }
  }

  async getPrefixes(prefix) {
    await this.checkInit()
    const storedItems = await this.abstractStore.getAllPois()
    return storedItems.filter((storedItem) => {
      return ExtendedString.compareIgnoreCase(storedItem.name, prefix) === 0 /* start with */
    })
  }

  async has(poi) {
    await this.checkInit()
    try {
      return await this.abstractStore.has(poi.getKey())
    } catch (e) {
      Error.sendOnce('store', 'has', 'error checking existing key', e)
    }
  }

  async add(poi) {
    await this.checkInit()
    try {
      await this.abstractStore.set(poi.getKey(), poi.poiStoreLiteral())
    } catch(e) {
      Error.sendOnce('store', 'add', 'error adding poi', e)
    }
  }

  async del(poi) {
    await this.checkInit()
    try {
      await this.abstractStore.del(poi.getKey())
    } catch(e) {
      Error.sendOnce('store', 'del', 'error deleting key', e)
    }
  }

  async clear() {
    await this.checkInit()
    try {
      await this.abstractStore.clear()
    } catch(e) {
      Error.sendOnce('store', 'clear', 'error clearing store', e)
    }
  }
}
