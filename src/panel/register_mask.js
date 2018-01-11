import RegisterMaskPanelView from 'dot-loader!../views/register_mask.dot'
import Panel from "../libs/panel";
import Store from "../adapters/store"


function RegisterMaskPanel() {
  this.store = new Store()
  this.panel = new Panel(this, RegisterMaskPanelView)
  this.isActive = false

  listen('register_panel__show', () => {
    this.panel.animate(.25, '.register_mask_panel', {top : 0})
  })
}

RegisterMaskPanel.prototype.register = function () {
  this.store.register().then(() => {
    this.panel.animate(.25, '.register_mask_panel', {top : '-300px'})
  })
    .catch((e) => {
      console.error(e)
    })
}

export default RegisterMaskPanel