import MasqActivatingModalView from '../views/masq_activating_modal.dot';
import Modal from './modal';

export default class MasqActivatingModal {
  constructor() {
    // get masqErrorModal from window if already initialized
    if (window.__masqActivatingModal) {
      return window.__masqActivatingModal;
    }
    // if masqErrorModal not initialized, use this
    window.__masqActivatingModal = this;

    this.modal = new Modal(this, MasqActivatingModalView, false);

    this.activating = false;
    this.successful = false;
  }

  open() {
    this.activating = true;
    this.successful = false;
    this.modal.open();
  }

  close() {
    this.activating = false;
    this.modal.close();
  }

  succeeded() {
    this.activating = false;
    this.successful = true;
    this.modal.panel.update();
  }

  failed(message) {
    this.activating = false;
    this.successful = false;
    this.errorMessage = message;
    this.modal.panel.update();
  }
}
