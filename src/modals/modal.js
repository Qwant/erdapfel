import ModalView from '../views/modal.dot'
import Panel from '../libs/panel'

export default class modal {
  constructor(child, v) {
    this.active = false
    this.panel = new Panel(this, ModalView)
    this.child = new Panel(child, v)

    child.renderModal = () => this.panel.render()
  }

  open () {
    this.active = true
    this.panel.update()
  }

  close () {
    this.active = false
    this.panel.update()
  }
}
