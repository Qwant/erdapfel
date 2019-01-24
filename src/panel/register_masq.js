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
      listen('register_panel__show', () => {
        this.panel.animate(.25, '.register_masq_panel', {top : '100px'})
      })
    }
  }

  async register() {
    try {
      await this.store.register()
    } catch(e) {
      Error.sendOnce('register_masq', 'register', 'error registering masq', e)
    }
    this.panel.animate(.25, '.register_masq_panel', {top : '-300px'})
  }
}
