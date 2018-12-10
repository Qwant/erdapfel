import RegisterMasqPanelView from '../views/register_masq.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"
import Error from '../adapters/error'


function RegisterMasqPanel() {
  this.store = new Store()
  this.panel = new Panel(this, RegisterMasqPanelView)
  this.isActive = false

  listen('register_panel__show', () => {
    this.panel.animate(.25, '.register_masq_panel', {top : '100px'})
  })
}

RegisterMasqPanel.prototype.register = function () {
  this.store.register().then(() => {
    this.panel.animate(.25, '.register_masq_panel', {top : '-300px'})
  })
  .catch((e) => {
    Error.displayOnce('register_masq', 'register', 'error registering masq', e)
  })
}

export default RegisterMasqPanel