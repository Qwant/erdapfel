import FeedbackModalView from '../views/feedback_modal.dot'
import Modal from "./modal"

export default class FeedbackModal {
  constructor(pois) {
    this.modal = new Modal(this, FeedbackModalView)

    this.pois = pois || []
    this.current_query = ''
    this.result_not_found = false

    listen('open_feedback_modal', () => {
      this.current_query = window.__searchInput.searchInputHandle.value
      this.modal.open()
    })
  }

  toggleResultNotFound () {
    this.result_not_found = !this.result_not_found
    this.modal.panel.update()
  }

  close () {
    this.modal.close()
  }
}
