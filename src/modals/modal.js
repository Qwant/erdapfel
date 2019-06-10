import ModalView from '../views/modal.dot';
import Panel from '../libs/panel';

export default class Modal {
  constructor(child, v, closeOnOverlay = true) {
    this.active = false;
    this.panel = new Panel(this, ModalView);
    this.childPanel = new Panel(child, v);
    this.child = child;

    this.closeOnOverlay = Boolean(closeOnOverlay);

    child.renderModal = () => this.panel.render();
  }

  open() {
    if (Modal.currentOpenened) {
      Modal.currentOpenened.modal.close();
    }
    Modal.currentOpenened = this.child;
    this.active = true;
    this.panel.update();
  }

  overlayClickHandler() {
    if (this.closeOnOverlay) {
      this.child.close();
    }
  }

  close() {
    Modal.currentOpenened = false;
    this.active = false;
    this.panel.update();
  }
}

Modal.currentOpenened = false;
