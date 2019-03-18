import ModalView from '../views/modal.dot'
import Panel from '../libs/panel'

export default class Modal {
  constructor(child, v) {
    this.active = false
    this.panel = new Panel(this, ModalView)
    this.childPanel = new Panel(child, v)
    this.child = child

    child.renderModal = () => this.panel.render()
  }

  open () {
    if(Modal.currentOpenened) {
      Modal.currentOpenened.modal.close()
    }
    Modal.currentOpenened = this.child
    this.active = true
    this.panel.update()
  }

  close () {
    Modal.currentOpenened = false
    this.active = false
    this.panel.update()
  }
}

Modal.currentOpenened = false
