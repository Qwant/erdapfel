import LoginMasqPanelView from '../views/login_masq.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import Error from '../adapters/error'
import nconf from "../../local_modules/nconf_getter";
let moduleConfig = nconf.get().store


export default class LoginMasqPanel {
  constructor() {
    this.panel = new Panel(this, LoginMasqPanelView)
    this.store = new Store()
    this.isActive = false
    this.loggingIn = false
    this.username = null
    this.profileImage = null
    this.isLoggedIn = false

    this.init()
  }

  async init() {
    this.isLoggedIn = await this.store.isLoggedIn()
    if (this.isLoggedIn) {
      const { username, profileImage } = await this.store.getUserInfo()
      this.username = username
      this.profileImage = profileImage
    }
    this.isActive = true
    this.panel.update()
  }

  async login() {
    this.loggingIn = true
    this.panel.update()
    try {
      await this.store.login()
      this.isLoggedIn = await this.store.isLoggedIn()
      if (this.isLoggedIn) {
        const { username, profileImage } = await this.store.getUserInfo()
        this.username = username
        this.profileImage = profileImage
      }
    } catch(e) {
      Error.sendOnce('login_masq', 'login', 'error loggingIn masq', e)
      this.isLoggedIn = await this.store.isLoggedIn()
    }
    this.loggingIn = false
    this.panel.animate(.25, '.login_masq_panel', {top : '-300px'})
    this.panel.update()
  }

  async logout() {
    await this.store.logout()
    this.isLoggedIn = await this.store.isLoggedIn()
    if (this.isLoggedIn) {
      const { username, profileImage } = await this.store.getUserInfo()
      this.username = username
      this.profileImage = profileImage
    }
    this.panel.update()
    return
  }
}
