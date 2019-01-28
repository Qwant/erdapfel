import RegisterMasqPanelView from '../views/register_masq.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import Error from '../adapters/error'
import nconf from "../../local_modules/nconf_getter";
let moduleConfig = nconf.get().store


export default class RegisterMasqPanel {
  constructor() {
    this.panel = new Panel(this, RegisterMasqPanelView)
    if(moduleConfig.name === 'masq') {
      this.store = new Store()
      this.isActive = false
      this.registering = false
      this.username = null
      listen('register_panel__show', () => {
        this.panel.animate(.25, '.register_masq_panel', {top : '100px'})
      })

      this.isRegistered = false
      this.store.isRegistered().then((b) => {
        this.isRegistered = b
        this.panel.update()
      })
    }
  }

  async register() {
    this.regsitering = true
    try {
      await this.store.register()
      this.regsitering = false
      this.isRegistered = await this.store.isRegistered()
    } catch(e) {
      Error.sendOnce('register_masq', 'register', 'error registering masq', e)
      this.regsitering = false
      this.isRegistered = await this.store.isRegistered()
    }
    this.panel.animate(.25, '.register_masq_panel', {top : '-300px'})
    this.panel.update()
  }

  async unregister() {
    await this.store.unregister()
    this.isRegistered = await this.store.isRegistered()
    window.location.reload()
    this.panel.update()
    return
  }
}
