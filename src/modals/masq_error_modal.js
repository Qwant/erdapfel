import MasqErrorModalView from '../views/masq_error_modal.dot'
import Modal from "./modal"

export default class MasqErrorModal {
  constructor() {
    // get masqErrorModal from window if already initialized
    if (window.__masqErrorModal) {
      return window.__masqErrorModal
    }
    // if masqErrorModal not initialized, use this
    window.__masqErrorModal = this

    this.modal = new Modal(this, MasqErrorModalView)

    this.opened = false
  }


  open (title, subtitle) {
    this.title = title
    this.subtitle = subtitle || ''
    this.modal.panel.update()
    this.opened = true
    this.modal.open()
  }

  close () {
    this.opened = false
    this.modal.close()
  }
}
