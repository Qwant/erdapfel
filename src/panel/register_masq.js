import RegisterMasqPanelView from 'dot-loader!../views/register_masq.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"


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
    console.error(e)
  })
}

export default RegisterMasqPanel