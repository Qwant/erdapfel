import FeedbackModalView from '../views/feedback_modal.dot'
import ExtendedString from "../libs/string"
import Modal from "./modal"

export default class FeedbackModal {
  constructor(results) {
    this.modal = new Modal(this, FeedbackModalView)

    this.original_results = []
    this.results = []
    this.current_query = ''
    this.result_not_found = false
    this.selected_result = {}
    this.ExtendedString = ExtendedString

    listen('open_feedback_modal', (results) => {
      this.current_query = window.__searchInput.searchInputHandle.value
      this.original_results = this.results = results || []
      this.results.forEach((res, idx) => {
        res.icon = IconManager.get({className : res.className, subClassName : res.subClassName , type : res.type})
      })
      this.modal.open()
    })
  }

  toggleResultNotFound () {
    this.result_not_found = !this.result_not_found
    this.modal.panel.update()
  }

  selectResult(result) {
    // if we click again on the same result
    // let's load the origin results again
    if (result === this.selected_result) {
      this.selected_result = {}
      this.results = this.original_results
    } else {
      this.selected_result = result
      this.results = this.results.filter(res => res.id === result.id)
    }
    this.modal.panel.update()
  }

  renderFormDetails() {
    return `
      <hr />
      <p>Cochez les résultats qui vous semblent inappropriés :</p>
      <div class="modal__input_control">
        <input type="checkbox" name="result_duplicate" value="result_duplicate"> <label for="result_duplicate">Présence de doublons</label>
      </div>
      <div class="modal__input_control">
        <input type="checkbox" name="result_ranking" value="result_ranking"> <label for="result_ranking">Mauvais classement</label>
      </div>
      <div class="modal__input_control">
        <input type="checkbox" name="result_geolocation" value="result_geolocation"> <label for="result_geolocation">Localisation erronée</label>
      </div>
      <div class="modal__input_control">
        <input type="checkbox" name="result_other" value="result_other"> <label for="result_other">Autre</label>
      </div>
      <div class="modal__input_control">
        <p>Donnez-nous plus d'informations :</p>
        <textarea name="more" col="10" row="10"></textarea>
      </div>
    `
  }

  close () {
    this.modal.close()
  }
}
