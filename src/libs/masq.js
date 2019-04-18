import Error from '../adapters/error'

const handleError = (fct, msg, e) => {
  Error.sendOnce('masq_store', fct, msg, e)
}

export default class MasqStore {
  constructor(config) {
    this.storeName = 'masq'

    this.masq = null
    this.loginLink = null
    this.config = config

    this.initPromise = this.init()
    this.initialized = false
  }

  async init() {
    const masqOptions = {
      hubUrls: this.config.signalhubUrl,
      masqAppBaseUrl: this.config.baseMasqAppUrl
    }

    const stunTurn = this._getStunTurnFromConf()
    if (stunTurn.length > 0) {
      masqOptions.swarmConfig = {
        iceServers: stunTurn
      }
    }

    const { default: Masq } = await import(/* webpackChunkName: "masq-lib" */ 'masq-lib')
    const masqIconUrl = document.baseURI.replace(/(\/+)$/g, '') + this.config.icon
    this.masq = new Masq(this.config.title, this.config.desc, masqIconUrl, masqOptions)

    if (this.masq.isLoggedIn()) {
      await this.masq.connectToMasq()
    } else {
      this.loginLink = await this.masq.getLoginLink()
    }
    this.initialized = true
  }

  async checkInit() {
    if (!this.initialized) {
      await this.initPromise
    }
  }

  _getStunTurnFromConf() {
    let stunTurn = []
    if (this.config.stun) {
      stunTurn.push({
        urls: this.config.stun
      })
    }
    if (this.config.turn) {
      const splitTurn = this.config.turn.split('|')
      stunTurn.push({
        urls: splitTurn[0],
        username: splitTurn[1],
        credential: splitTurn[2]
      })
    }
    return stunTurn
  }

  openLoginPopupWindow(link) {
    this.masqPopupWindow = window.open(link, 'masq', 'height=700,width=500')
    this.masqPopupWindow.focus()
  }

  async login(apps) {
    await this.checkInit()
    // open Masq app window to connect to Masq
    this.openLoginPopupWindow(this.loginLink)

    await this.masq.logIntoMasq(true)
  }

  async logout() {
    await this.checkInit()
    this.loginLink = await this.masq.getLoginLink()
    await this.masq.signout()
  }

  async isLoggedIn() {
    await this.checkInit()
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

    try {
      const list = await this.masq.list()

      const filteredValues = Object.entries(list)
        .filter(kv => Poi.isPoiCompliantKey(kv[0]))
        .map(kv => kv[1])

      return filteredValues
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
