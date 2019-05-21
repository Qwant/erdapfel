import FeedbackModalView from '../views/feedback_modal.dot'
import Modal from "./modal"

export default class FeedbackModal {
  constructor() {
    this.modal = new Modal(this, FeedbackModalView)

    listen('open_feedback_modal', () => {
      this.modal.open()
    })
  }

  close () {
    this.modal.close()
  }
}
