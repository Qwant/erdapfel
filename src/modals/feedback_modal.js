import FeedbackModalView from '../views/feedback_modal.dot'
import ExtendedString from "../libs/string"
import Modal from "./modal"

export default class FeedbackModal {
  constructor(results) {
    this.modal = new Modal(this, FeedbackModalView)

    this.ExtendedString = ExtendedString

    this.original_results = []
    this.displayed_results = []
    this.current_query = ''

    this.fields = {
      result_not_found: false,
      result_not_found_details: '',
      result_duplicate: false,
      result_bad_ranking: false,
      result_wrong_geolocation: false,
      result_other: false,
      result_other_details: '',
    }

    this.selected_result = {}

    listen('open_feedback_modal', (results) => {
      this.current_query = window.__searchInput.searchInputHandle.value
      this.original_results = this.displayed_results = results || []
      this.displayed_results.forEach((res, idx) => {
        res.icon = IconManager.get({className : res.className, subClassName : res.subClassName , type : res.type})
      })
      this.modal.open()
    })
  }

  toggleInputField (key) {
    this.fields[key] = !this.fields[key]
    this.update()
  }

  selectResult(result) {
    // if we click again on the same result
    // let's load the origin results again
    if (result === this.selected_result) {
      this.selected_result = {}
      this.displayed_results = this.original_results
    } else {
      this.selected_result = result
      this.displayed_results = this.displayed_results.filter(res => res.id === result.id)
    }
    this.update()
  }

  update () {
    this.modal.panel.update()
  }

  close () {
    this.modal.close()
  }

  send() {
    this.close()
  }
}
