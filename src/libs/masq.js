const Client = require('masq-client').Client

class Masq {
  constructor () {
    this.ready = false
    this.client = new Client({
      socketUrl: 'ws://localhost:8080',
      socketConf: { requestTimeout: 0 }
    })
  }

  async onConnect (regParams) {
    await this.client.init(regParams)
    this.ready = true
  }

  async waitUntilReady () {
    return new Promise ((resolve, reject) => {
      const intervalID = window.setInterval(() => {
        if (this.ready) {
          window.clearInterval(intervalID)
          return resolve()
        }
      }, 10)
    })
  }

  async get (k) {
    await this.waitUntilReady()
    try {
      return await this.client.getItem(k)
    } catch (e) {
      throw e.name
    }
  }

  async set (k, v) {
    await this.waitUntilReady()
    try {
      await this.client.setItem(k, v)
    } catch (e) {
      throw e.name
    }
  }

  async del (k) {
    await this.waitUntilReady()
    try {
      await this.client.removeItem(k)
    } catch (e) {
      throw e.name
    }
  }

  async getAll () {
    const keys = await this.client.listKeys()
    const items = keys.map(k => this.client.getItem(k))
    return Promise.all(items)
  }

  async clear () {
    await this.waitUntilReady()
    const keys = await this.client.listKeys()
    const items = keys.map(k => this.client.del(k))
    return Promise.all(items)
  }
}

module.exports = Masq
